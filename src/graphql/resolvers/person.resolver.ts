import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";
import { Survey } from "../models/survey.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find().populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id).populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }).populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getVolunteers: async () => {
      return await Person.find({ isVolunteer: true }).populate('sacraments');
    },
    getPeopleByYear: async (_: any, { year }: { year: string }) => {
      const participantIds = await Course.aggregate([
        { $match: { year } },
        { $project: { participants: { $concatArrays: ["$catechists", "$catechumens"] } } },
        { $unwind: "$participants" },
        { $group: { _id: null, allParticipants: { $addToSet: "$participants" } } }
      ]);

      const allParticipantIds = participantIds[0]?.allParticipants || [];

      return Person.find({
        '_id': { $nin: allParticipantIds }
      })
      .populate('sacraments');
    },
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const person = new Person(rest);
      await person.save();
      return await Person.findById(person.id).populate("sacraments coursesAsCatechist coursesAsCatechumen");
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechist coursesAsCatechumen");
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const person = await Person.findById(id);
        if (!person) throw new Error("Person not found");

        await Person.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    addSacramentToPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    removeSacramentFromPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    createPeopleBulk: async (_: any, { input }: { input: PersonInput[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const processedInput = input.map(person => ({
          ...person,
          birthDate: person.birthDate ? person.birthDate : (person.age ? generateBirthDateFromAge(parseInt(person.age)) : undefined)
        }));
        const people = await Person.insertMany(processedInput, { session });
        await session.commitTransaction();
        session.endSession();

        return await Person.find({ _id: { $in: people.map(p => p._id) } }).populate('sacraments');
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    },
    deletePeopleBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Delete the people
        const result = await Person.deleteMany({ _id: { $in: ids } }, { session });

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
