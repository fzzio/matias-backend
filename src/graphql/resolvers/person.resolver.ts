import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";
import { Survey } from "../models/survey.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find().populate("sacraments surveys"),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id).populate("sacraments surveys"),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }).populate("sacraments surveys"),
    getVolunteers: async () => {
      return await Person.find({ isVolunteer: true }).populate('sacraments');
    },
    getPeopleByYear: async (_: any, { year }: { year: string }) => {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      return await Person.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('sacraments');
    },
  },
  Mutation: {
    addSacramentToPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    createPeopleBulk: async (_: any, { input }: { input: PersonInput[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const createdPeople = await Promise.all(input.map(async (personData) => {
          const { age, ...rest } = personData;
          if (!rest.birthDate && age !== undefined) {
            rest.birthDate = generateBirthDateFromAge(parseInt(age));
          }
          const person = new Person(rest);

          await person.save({ session });
          return person;
        }));

        await session.commitTransaction();
        return createdPeople;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const person = new Person(rest);
      await person.save();
      return await Person.findById(person.id).populate("sacraments");
    },
    deletePeopleBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        // Remove people from all surveys
        await Survey.updateMany(
          { people: { $in: ids } },
          { $pull: { people: { $in: ids } } }
        );

        const result = await Person.deleteMany({ _id: { $in: ids } });

        await session.commitTransaction();
        return result.deletedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const person = await Person.findById(id);
        if (!person) throw new Error("Person not found");

        // Remove person from all surveys
        await Survey.updateMany(
          { people: id },
          { $pull: { people: id } }
        );

        await Person.findByIdAndDelete(id);

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    removeSacramentFromPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments surveys");
    },
  },
};

export interface PersonInput {
  idCard?: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  age?: string;
  sacraments?: string[];
  isVolunteer?: boolean;
}

export default personResolvers;
