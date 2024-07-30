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
      const catechist = await Catechist.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!catechist) throw new Error("Catechist not found");
      return catechist.populate("sacraments coursesAsCatechist");
    },
    deleteCatechist: async (_: any, { id }: { id: string }) => {
      const catechist = await Catechist.findByIdAndDelete(id);
      if (!catechist) throw new Error("Catechist not found");
      return true;
    },
    addSacramentToCatechist: async (_: any, { catechistId, sacramentId }: { catechistId: string; sacramentId: string }) => {
      const catechist = await Catechist.findByIdAndUpdate(
        catechistId,
        { $addToSet: { sacraments: sacramentId } },
        { new: true, runValidators: true }
      );
      if (!catechist) throw new Error("Catechist not found");
      return catechist.populate("sacraments coursesAsCatechist");
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
  },
  createCatechistsBulk: async (_: any, { input }: { input: CatechistInput[] }) => {
    // TODO
  },
  deleteCatechistsBulk: async (_: any, { ids }: { ids: string[] }) => {
    // TODO
  }
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
