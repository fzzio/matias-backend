import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Catechumen } from "../models/catechumen.model.js";
import { Survey } from "../models/survey.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const catechumenResolvers = {
  Query: {
    getCatechumens: async () => await Catechumen.find().populate("sacraments coursesAsCatechumen"),
    getCatechumen: async (_: any, { id }: { id: string }) => await Catechumen.findById(id).populate("sacraments coursesAsCatechumen"),
    getCatechumenByIdCard: async (_: any, { idCard }: { idCard: string }) => await Catechumen.findOne({ idCard }).populate("sacraments coursesAsCatechumen"),
    getCatechumensWithoutVisit: async (_: any, { year }: any) => {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      const catechumenIdsWithSurvey = await Survey.distinct("catechumens", {
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const allCatechumenIds = await Course.aggregate([
        { $match: { year } },
        { $unwind: "$catechumens" },
        { $group: { _id: null, allCatechumens: { $addToSet: "$catechumens" } } }
      ]);

      const catechumenIds = allCatechumenIds.length ? allCatechumenIds[0].allCatechumens : [];

      const catechumensWithoutSurvey = catechumenIds.filter((id: { toString: () => mongoose.Types.ObjectId; }) => !catechumenIdsWithSurvey.includes(id.toString()));

      return Catechumen.find({
        '_id': { $in: catechumensWithoutSurvey }
      }).populate('sacraments coursesAsCatechumen');
    },
  },
  Mutation: {
    createCatechumen: async (_: any, { input }: { input: CatechumenInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const catechumen = new Catechumen(rest);
      await catechumen.save();
      return await Catechumen.findById(catechumen.id).populate("sacraments coursesAsCatechumen");
    },
    updateCatechumen: async (_: any, { id, input }: { id: string; input: CatechumenInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await Catechumen.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechumen");
    },
    deleteCatechumen: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const catechumen = await Catechumen.findById(id);
        if (!catechumen) throw new Error("Catechumen not found");

        // Remove catechumen from courses
        await Course.updateMany(
          { $or: [{ catechists: id }, { catechumens: id }] },
          { $pull: { catechists: id, catechumens: id } },
          { session }
        );

        // Delete the catechumen
        await Catechumen.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    addSacramentToCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await Catechumen.findByIdAndUpdate(catechumenId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments coursesAsCatechumen");
    },
    removeSacramentFromCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await Catechumen.findByIdAndUpdate(catechumenId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments coursesAsCatechumen");
    },
    createCatechumensBulk: async (_: any, { input }: { input: CatechumenInput[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const processedInput = input.map(catechumen => ({
          ...catechumen,
          birthDate: catechumen.birthDate ? catechumen.birthDate : (catechumen.age ? generateBirthDateFromAge(parseInt(catechumen.age)) : undefined)
        }));
        const people = await Catechumen.insertMany(processedInput, { session });
        await session.commitTransaction();
        session.endSession();

        return await Catechumen.find({ _id: { $in: people.map(p => p._id) } }).populate('sacraments coursesAsCatechumen');
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    },
    deleteCatechumensBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Remove people from courses
        await Course.updateMany(
          { $or: [{ catechists: { $in: ids } }, { catechumens: { $in: ids } }] },
          { $pull: { catechists: { $in: ids }, catechumens: { $in: ids } } },
          { session }
        );

        // Delete the people
        const result = await Catechumen.deleteMany({ _id: { $in: ids } }, { session });

        await session.commitTransaction();
        return result.deletedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
  },
};

export interface CatechumenInput {
  idCard?: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  age?: string;
  sacraments?: string[];
  coursesAsCatechumen?: string[];
}

export default catechumenResolvers;
