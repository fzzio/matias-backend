import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find().populate("sacraments"),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id).populate("sacraments"),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }).populate("sacraments"),
    getCatechists: async () => {
      return await Person.find({ isCatechist: true }).populate('courses');
    },
    getCatechizands: async (_: any, { year }: { year: string }) => {
      const catechizandIds = await Course.aggregate([
        { $match: { year } },
        { $unwind: "$catechizands" },
        { $group: { _id: null, allCatechizands: { $addToSet: "$catechizands" } } }
      ]);

      const allCatechizandIds = catechizandIds[0]?.allCatechizands || [];

      return Person.find({ '_id': { $in: allCatechizandIds } });
    },
    getNonParticipants: async (_: any, { year }: { year: string }) => {
      const participantIds = await Course.aggregate([
        { $match: { year } },
        { $project: { participants: { $concatArrays: ["$catechists", "$catechizands"] } } },
        { $unwind: "$participants" },
        { $group: { _id: null, allParticipants: { $addToSet: "$participants" } } }
      ]);

      const allParticipantIds = participantIds[0]?.allParticipants || [];

      return Person.find({
        '_id': { $nin: allParticipantIds },
        'isCatechist': false
      });
    },
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const person = new Person(input);
      await person.save();
      return await Person.findById(person.id).populate("sacraments coursesAsCatechist coursesAsCatechizand");
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate("sacraments coursesAsCatechist coursesAsCatechizand");
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const result = await Person.findByIdAndDelete(id);
      return !!result;
    },
    addSacramentToPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    removeSacramentFromPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    createPeopleBulk: async (_: any, { input }: { input: PersonInput[] }) => {
      const people = await Person.insertMany(input);
      return people;
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
    addPersonToCourse: async (_: any, { personId, courseId, role }: { personId: string; courseId: string; role: 'catechist' | 'catechizand' }) => {
      const person = await Person.findById(personId);
      const course = await Course.findById(courseId);

      if (!person || !course) {
        throw new Error('Person or Course not found');
      }

      if (role === 'catechist' && !person.isCatechist) {
        throw new Error('This person is not a catechist');
      }

      const updateField = role === 'catechist' ? 'coursesAsCatechist' : 'coursesAsCatechizand';
      const courseUpdateField = role === 'catechist' ? 'catechists' : 'catechizands';

      await Person.findByIdAndUpdate(personId, { $addToSet: { [updateField]: courseId } });
      await Course.findByIdAndUpdate(courseId, { $addToSet: { [courseUpdateField]: personId } });

      return Person.findById(personId).populate('coursesAsCatechist coursesAsCatechizand');
    },
    removePersonFromCourse: async (_: any, { personId, courseId, role }: { personId: string; courseId: string; role: 'catechist' | 'catechizand' }) => {
      const updateField = role === 'catechist' ? 'coursesAsCatechist' : 'coursesAsCatechizand';
      const courseUpdateField = role === 'catechist' ? 'catechists' : 'catechizands';

      await Person.findByIdAndUpdate(personId, { $pull: { [updateField]: courseId } });
      await Course.findByIdAndUpdate(courseId, { $pull: { [courseUpdateField]: personId } });

      return Person.findById(personId).populate('coursesAsCatechist coursesAsCatechizand');
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
  coursesAsCatechist?: string[];
  coursesAsCatechizand?: string[];
}

export default personResolvers;
