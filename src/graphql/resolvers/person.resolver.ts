import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";
import { Survey } from "../models/survey.model.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find().populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id).populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }).populate("sacraments coursesAsCatechist coursesAsCatechumen"),
    getCatechists: async () => {
      return await Person.find({ isCatechist: true }).populate('coursesAsCatechist sacraments');
    },
    getVolunteers: async () => {
      return await Person.find({ isVolunteer: true }).populate('sacraments');
    },
    getCatechumens: async (_: any, { year }: { year: string }) => {
      const catechumenIds = await Course.aggregate([
        { $match: { year } },
        { $unwind: "$catechumens" },
        { $group: { _id: null, allCatechumens: { $addToSet: "$catechumens" } } }
      ]);

      const allCatechumenIds = catechumenIds[0]?.allCatechumens || [];

      return Person.find({ '_id': { $in: allCatechumenIds } })
        .populate('sacraments coursesAsCatechumen');
    },
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

      return Person.find({
        '_id': { $in: catechumensWithoutSurvey }
      }).populate('sacraments coursesAsCatechumen');
    },
    getNonParticipants: async (_: any, { year }: { year: string }) => {
      const participantIds = await Course.aggregate([
        { $match: { year } },
        { $project: { participants: { $concatArrays: ["$catechists", "$catechumens"] } } },
        { $unwind: "$participants" },
        { $group: { _id: null, allParticipants: { $addToSet: "$participants" } } }
      ]);

      const allParticipantIds = participantIds[0]?.allParticipants || [];

      return Person.find({
        '_id': { $nin: allParticipantIds },
        'isCatechist': false
      })
      .populate('sacraments');
    },
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const person = new Person(input);
      await person.save();
      return await Person.findById(person.id).populate("sacraments coursesAsCatechist coursesAsCatechumen");
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechist coursesAsCatechumen");
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const person = await Person.findById(id);
        if (!person) throw new Error("Person not found");

        // Remove person from courses
        await Course.updateMany(
          { $or: [{ catechists: id }, { catechumens: id }] },
          { $pull: { catechists: id, catechumens: id } }
        );

        // Delete the person
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
        const people = await Person.insertMany(input.map(person => ({
          ...person,
          sacraments: person.sacraments,
        })), { session });

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
      const result = await Person.deleteMany({ _id: { $in: ids } });
      return result.deletedCount;
    },
    updateCatechistStatus: async (_: any, { personId, enable }: { personId: string; enable: boolean }) => {
      const updatedPerson = await Person.findByIdAndUpdate(
        personId,
        { isCatechist: enable },
        { new: true, runValidators: true }
      );

      if (!updatedPerson) {
        throw new Error('No person found with this ID');
      }

      return updatedPerson;
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
  sacraments?: string[];
  isCatechist?: boolean;
  isVolunteer?: boolean;
  coursesAsCatechist?: string[];
  coursesAsCatechumen?: string[];
}

export default personResolvers;
