import mongoose, { Types } from "mongoose";

import { Course } from "../models/course.model.js";
import { Catechumen } from "../models/catechumen.model.js";
import { Survey } from "../models/survey.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const populateCatechumenData = async (catechumenIds: Types.ObjectId[]) => {
  return Catechumen.find({ '_id': { $in: catechumenIds } })
    .populate('sacraments')
    .populate({
      path: 'coursesAsCatechumen',
      populate: [
        { path: 'catechismLevel' },
        { path: 'location' },
        { path: 'catechists' }
      ]
    });
};

const formatCatechumenData = (catechumen: any) => {
  if (!catechumen || !catechumen._id) {
    console.error('Invalid catechumen data:', catechumen);
    return null;
  }

  return {
    ...catechumen.toObject(),
    id: catechumen._id.toString(),
    coursesAsCatechumen: catechumen.coursesAsCatechumen.map((c: any) => {
      if (!c || !c._id) {
        console.error('Invalid course data:', c);
        return null;
      }

      return {
        ...c.toObject(),
        id: c._id.toString(),
        location: c.location ? {
          ...c.location.toObject(),
          id: c.location._id.toString()
        } : null,
        catechists: c.catechists ? c.catechists.map((catechist: any) => {
          if (!catechist || !catechist._id) {
            console.error('Invalid catechist data:', catechist);
            return null;
          }
          return {
            ...catechist.toObject(),
            id: catechist._id.toString()
          };
        }).filter(Boolean) : [],
        catechismLevel: c.catechismLevel ? {
          ...c.catechismLevel.toObject(),
          id: c.catechismLevel._id.toString()
        } : null
      };
    }).filter(Boolean)
  };
};

const catechumenResolvers = {
  Query: {
    getCatechumen: async (_: any, { id }: { id: string }) => await Catechumen.findById(id).populate("sacraments coursesAsCatechumen"),
    getCatechumenByIdCard: async (_: any, { idCard }: { idCard: string }) => await Catechumen.findOne({ idCard }).populate("sacraments coursesAsCatechumen"),
    getCatechumens: async () => await Catechumen.find().populate("sacraments coursesAsCatechumen"),
    getCatechumensByYear: async (_: any, { year }: { year: string }) => {
      const courses = await Course.find({ year }).populate({
        path: 'catechumens',
        populate: [
          { path: 'sacraments' },
          {
            path: 'coursesAsCatechumen',
            populate: [
              { path: 'catechismLevel' },
              { path: 'location' },
              { path: 'catechists' }
            ]
          }
        ]
      });

      const catechumens = courses.flatMap(course =>
        course.catechumens.map((catechumen: any) => formatCatechumenData(catechumen))
      ).filter(Boolean);

      return catechumens;
    },
    getCatechumensWithoutVisitByYear: async (_: any, { year }: { year: string }) => {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      const catechumenIdsWithSurvey = await Survey.distinct("catechumens", {
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const catechumenIdsWithSurveySet = new Set(catechumenIdsWithSurvey.map(id => id.toString()));

      const allCatechumenIds = await Course.aggregate([
        { $match: { year } },
        { $unwind: "$catechumens" },
        { $group: { _id: null, allCatechumens: { $addToSet: "$catechumens" } } }
      ]);

      const catechumenIds = allCatechumenIds.length ? allCatechumenIds[0].allCatechumens : [];

      const catechumensWithoutSurvey = catechumenIds.filter(
        (id: Types.ObjectId) => !catechumenIdsWithSurveySet.has(id.toString())
      );

      const catechumens = await populateCatechumenData(catechumensWithoutSurvey);

      return catechumens.map(formatCatechumenData).filter(Boolean);
    },
  },
  Mutation: {
    addSacramentToCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await Catechumen.findByIdAndUpdate(catechumenId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments coursesAsCatechumen");
    },
    createCatechumen: async (_: any, { input }: { input: CatechumenInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const catechumen = new Catechumen(rest);
      await catechumen.save();
      return await Catechumen.findById(catechumen.id).populate("sacraments coursesAsCatechumen");
    },
    createCatechumensBulk: async (_: any, { input }: { input: CatechumenInput[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const createdCatechumens = await Promise.all(
          input.map(async (catechumenData) => {
            const { age, ...rest } = catechumenData;
            if (!rest.birthDate && age !== undefined) {
              rest.birthDate = generateBirthDateFromAge(parseInt(age));
            }
            const catechumen = new Catechumen(rest);
            await catechumen.save({ session });
            return catechumen;
          })
        );

        await session.commitTransaction();
        return createdCatechumens;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteCatechumen: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const catechumen = await Catechumen.findById(id);
        if (!catechumen) throw new Error("Catechumen not found");

        // Remove catechumen from all courses
        await Course.updateMany(
          { catechumens: id },
          { $pull: { catechumens: id } }
        );

        // Remove catechumen from all surveys
        await Survey.updateMany(
          { catechumens: id },
          { $pull: { catechumens: id } }
        );

        await Catechumen.findByIdAndDelete(id);

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteCatechumensBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        // Remove catechumens from all courses
        await Course.updateMany(
          { catechumens: { $in: ids } },
          { $pull: { catechumens: { $in: ids } } }
        );

        // Remove catechumens from all surveys
        await Survey.updateMany(
          { catechumens: { $in: ids } },
          { $pull: { catechumens: { $in: ids } } }
        );

        const result = await Catechumen.deleteMany({ _id: { $in: ids } });

        await session.commitTransaction();
        return result.deletedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    removeSacramentFromCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await Catechumen.findByIdAndUpdate(catechumenId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments coursesAsCatechumen");
    },
    updateCatechumen: async (_: any, { id, input }: { id: string; input: CatechumenInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await Catechumen.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechumen");
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
