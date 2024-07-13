import { Catechizand } from "../models/catechizand.model.js";
import { Person } from "../models/person.model.js";

const catechizandResolvers = {
  Query: {
    getCatechizands: async () => await Catechizand.find().populate("person course"),
    getCatechizand: async (_: any, { id }: { id: string }) => await Catechizand.findById(id).populate("person course"),
  },
  Mutation: {
    createCatechizand: async (_: any, { personId, courseId }: { personId: string; courseId: string }) => {
      const catechizand = new Catechizand({ person: personId, course: courseId });
      await catechizand.save();
      return await Catechizand.findById(catechizand.id).populate("person course");
    },
    deleteCatechizand: async (_: any, { id }: { id: string }) => {
      const result = await Catechizand.findByIdAndDelete(id);
      return !!result;
    },
    updateCatechizandCourse: async (_: any, { catechizandId, courseId }: { catechizandId: string; courseId: string }) => {
      return await Catechizand.findByIdAndUpdate(catechizandId, { course: courseId }, { new: true }).populate("person course");
    },
  },
};

export default catechizandResolvers;
