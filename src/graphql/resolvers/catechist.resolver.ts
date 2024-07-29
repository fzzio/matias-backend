import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Catechist } from "../models/catechist.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const catechistResolvers = {
  Query: {
    getCatechists: async () => await Catechist.find().populate("sacraments coursesAsCatechist"),
    getCatechist: async (_: any, { id }: { id: string }) => await Catechist.findById(id).populate("sacraments coursesAsCatechist"),
    getCatechistByIdCard: async (_: any, { idCard }: { idCard: string }) => await Catechist.findOne({ idCard }).populate("sacraments coursesAsCatechist"),
  },
  Mutation: {
    createCatechist: async (_: any, { input }: { input: CatechistInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const catechist = new Catechist(rest);
      await catechist.save();
      return await Catechist.findById(catechist.id).populate("sacraments coursesAsCatechist");
    },
    updateCatechist: async (_: any, { id, input }: { id: string; input: CatechistInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await Catechist.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechist");
    },
    deleteCatechist: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const catechist = await Catechist.findById(id);
        if (!catechist) throw new Error("Catechist not found");

        // Remove catechist from courses
        await Course.updateMany(
          { $or: [{ catechists: id }, { catechumens: id }] },
          { $pull: { catechists: id, catechumens: id } },
          { session }
        );

        // Delete the catechist
        await Catechist.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    addSacramentToCatechist: async (_: any, { catechistId, sacramentId }: { catechistId: string; sacramentId: string }) => {
      return await Catechist.findByIdAndUpdate(catechistId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    removeSacramentFromCatechist: async (_: any, { catechistId, sacramentId }: { catechistId: string; sacramentId: string }) => {
      return await Catechist.findByIdAndUpdate(catechistId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    createCatechistsBulk: async (_: any, { input }: { input: CatechistInput[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const processedInput = input.map(catechist => ({
          ...catechist,
          birthDate: catechist.birthDate ? catechist.birthDate : (catechist.age ? generateBirthDateFromAge(parseInt(catechist.age)) : undefined)
        }));
        const catechists = await Catechist.insertMany(processedInput, { session });
        await session.commitTransaction();
        session.endSession();

        return await Catechist.find({ _id: { $in: catechists.map(p => p._id) } }).populate('sacraments');
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    },
    deleteCatechistsBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Remove catechists from courses
        await Course.updateMany(
          { $or: [{ catechists: { $in: ids } }, { catechumens: { $in: ids } }] },
          { $pull: { catechists: { $in: ids }, catechumens: { $in: ids } } },
          { session }
        );

        // Delete the catechists
        const result = await Catechist.deleteMany({ _id: { $in: ids } }, { session });

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

export interface CatechistInput {
  idCard?: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  age?: string;
  sacraments?: string[];
  coursesAsCatechist?: string[];
}

export default catechistResolvers;
