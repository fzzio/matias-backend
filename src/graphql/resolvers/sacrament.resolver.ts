import { Sacrament } from "../models/sacrament.model.js";

const sacramentResolvers = {
  Query: {
    getSacraments: async () => await Sacrament.find(),
    getSacrament: async (_: any, { id }: { id: string }) => await Sacrament.findById(id),
  },
  Mutation: {
    createSacrament: async (_: any, { name }: { name: string }) => {
      const sacrament = new Sacrament({ name });
      return await sacrament.save();
    },
    updateSacrament: async (_: any, { id, name }: { id: string; name: string }) => {
      return await Sacrament.findByIdAndUpdate(id, { name }, { new: true });
    },
    deleteSacrament: async (_: any, { id }: { id: string }) => {
      const result = await Sacrament.findByIdAndDelete(id);
      return !!result;
    },
  },
};

export default sacramentResolvers;