import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Catechist } from "../models/catechist.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";
import { Survey } from "../models/survey.model.js";

const catechistResolvers = {
  Query: {
    getCatechist: async (_: any, { id }: { id: string }) => await Catechist.findById(id).populate("sacraments coursesAsCatechist"),
    getCatechistByIdCard: async (_: any, { idCard }: { idCard: string }) => await Catechist.findOne({ idCard }).populate("sacraments coursesAsCatechist"),
    getCatechists: async () => await Catechist.find().populate("sacraments coursesAsCatechist"),
  },
  Mutation: {
    addSacramentToCatechist: async (_: any, { catechistId, sacramentId }: { catechistId: string; sacramentId: string }) => {
      const catechist = await Catechist.findByIdAndUpdate(
        catechistId,
        { $addToSet: { sacraments: sacramentId } },
        { new: true, runValidators: true }
      );
      if (!catechist) throw new Error("Catechist not found");
      return catechist.populate("sacraments coursesAsCatechist");
    },
    createCatechist: async (_: any, { input }: { input: CatechistInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const catechist = new Catechist(rest);
      await catechist.save();
      return await Catechist.findById(catechist.id).populate("sacraments coursesAsCatechist");
    },
    createCatechistsBulk: async (_: any, { input }: { input: CatechistInput[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const createdCatechists = await Promise.all(
          input.map(async (catechistData) => {
            const { age, ...rest } = catechistData;
            if (!rest.birthDate && age !== undefined) {
              rest.birthDate = generateBirthDateFromAge(parseInt(age));
            }
            const catechist = new Catechist(rest);
            await catechist.save({ session });
            return catechist;
          })
        );

        await session.commitTransaction();
        return createdCatechists;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteCatechist: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const catechist = await Catechist.findById(id);
        if (!catechist) throw new Error("Catechist not found");

        // Remove catechist from all courses
        await Course.updateMany(
          { catechists: id },
          { $pull: { catechists: id } }
        );

        // Remove catechist from all surveys
        await Survey.updateMany(
          { catechists: id },
          { $pull: { catechists: id } }
        );

        await Catechist.findByIdAndDelete(id);

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteCatechistsBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        // Remove catechists from all courses
        await Course.updateMany(
          { catechists: { $in: ids } },
          { $pull: { catechists: { $in: ids } } }
        );

        // Remove catechists from all surveys
        await Survey.updateMany(
          { catechists: { $in: ids } },
          { $pull: { catechists: { $in: ids } } }
        );

        const result = await Catechist.deleteMany({ _id: { $in: ids } });

        await session.commitTransaction();
        return result.deletedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    removeSacramentFromCatechist: async (_: any, { catechistId, sacramentId }: { catechistId: string; sacramentId: string }) => {
      const catechist = await Catechist.findByIdAndUpdate(
        catechistId,
        { $pull: { sacraments: sacramentId } },
        { new: true, runValidators: true }
      );
      if (!catechist) throw new Error("Catechist not found");
      return catechist.populate("sacraments coursesAsCatechist");
    },
    updateCatechist: async (_: any, { id, input }: { id: string; input: CatechistInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      const catechist = await Catechist.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!catechist) throw new Error("Catechist not found");
      return catechist.populate("sacraments coursesAsCatechist");
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
