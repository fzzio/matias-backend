import { CatechismLevel } from "../models/catechismLevel.model.js";

const catechismLevelResolvers = {
  Query: {
    getCatechismLevels: async () => await CatechismLevel.find(),
    getCatechismLevel: async (_: any, { id }: { id: string }) => await CatechismLevel.findById(id),
  },
  Mutation: {
    createCatechismLevel: async (_: any, { name }: { name: string }) => {
      const catechismLevel = new CatechismLevel({ name });
      return await catechismLevel.save();
    },
    updateCatechismLevel: async (_: any, { id, name }: { id: string; name: string }) => {
      return await CatechismLevel.findByIdAndUpdate(id, { name }, { new: true });
    },
    deleteCatechismLevel: async (_: any, { id }: { id: string }) => {
      const result = await CatechismLevel.findByIdAndDelete(id);
      return !!result;
    },
  },
};

export default catechismLevelResolvers;