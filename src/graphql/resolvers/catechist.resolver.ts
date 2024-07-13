import { Catechist } from "../models/catechist.model.js";
import { Person } from "../models/person.model.js";

const catechistResolvers = {
  Query: {
    getCatechists: async () => await Catechist.find().populate("person courses"),
    getCatechist: async (_: any, { id }: { id: string }) => await Catechist.findById(id).populate("person courses"),
  },
  Mutation: {
    createCatechist: async (_: any, { personId }: { personId: string }) => {
      const catechist = new Catechist({ person: personId });
      await catechist.save();
      return await Catechist.findById(catechist.id).populate("person courses");
    },
    updateCatechist: async (_: any, { id, input }: { id: string; input: any }) => {
      return await Catechist.findByIdAndUpdate(id, input, { new: true }).populate("person courses");
    },
    deleteCatechist: async (_: any, { id }: { id: string }) => {
      const result = await Catechist.findByIdAndDelete(id);
      return !!result;
    },
    addCourseToCatechist: async (_: any, { catechistId, courseId }: { catechistId: string; courseId: string }) => {
      return await Catechist.findByIdAndUpdate(catechistId, { $addToSet: { courses: courseId } }, { new: true }).populate("person courses");
    },
    removeCoursFromCatechist: async (_: any, { catechistId, courseId }: { catechistId: string; courseId: string }) => {
      return await Catechist.findByIdAndUpdate(catechistId, { $pull: { courses: courseId } }, { new: true }).populate("person courses");
    },
    createManyCatechists: async (_: any, { input }: { input: any[] }) => {
      const catechists = await Catechist.insertMany(input);
      return Catechist.find({ _id: { $in: catechists.map(c => c._id) } }).populate("person courses");
    },
    deleteManyCatechists: async (_: any, { ids }: { ids: string[] }) => {
      const result = await Catechist.deleteMany({ _id: { $in: ids } });
      return result.deletedCount;
    },
  },
};

export default catechistResolvers;
