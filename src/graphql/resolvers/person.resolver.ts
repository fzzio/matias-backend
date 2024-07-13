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
      const courses = await Course.find({ year }).populate('catechizands');
      const catechizandIds: mongoose.Types.ObjectId[] = [];

      courses.forEach(course => {
        course.catechizands.forEach(person => {
          if (!catechizandIds.includes(person._id)) {
            catechizandIds.push(person._id);
          }
        });
      });

      return Person.find({ '_id': { $in: catechizandIds } });
    },
    getNonParticipants: async (_: any, { year }: { year: string }) => {
      const courses = await Course.find({ year }).populate('catechists catechizands');

      const participantIds: mongoose.Types.ObjectId[] = [];

      courses.forEach(course => {
        course.catechists.forEach(person => {
          if (!participantIds.includes(person._id)) {
            participantIds.push(person._id);
          }
        });
        course.catechizands.forEach(person => {
          if (!participantIds.includes(person._id)) {
            participantIds.push(person._id);
          }
        });
      });

      return Person.find({
        '_id': { $nin: participantIds },
        'isCatechist': false
      });
    },
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const person = new Person(input);
      await person.save();
      return await Person.findById(person.id).populate("sacraments");
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate("sacraments");
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
}

export default personResolvers;
