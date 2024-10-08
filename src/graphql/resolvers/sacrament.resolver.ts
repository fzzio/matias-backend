import mongoose from "mongoose";

import { Person } from "../models/person.model.js";
import { Sacrament } from "../models/sacrament.model.js";
import { Catechumen } from "../models/catechumen.model.js";
import { Catechist } from "../models/catechist.model.js";

const sacramentResolvers = {
  Query: {
    getSacrament: async (_: any, { id }: { id: string }) => await Sacrament.findById(id),
    getSacraments: async () => await Sacrament.find(),
  },
  Mutation: {
    createSacrament: async (_: any, { name }: { name: string }) => {
      const sacrament = new Sacrament({ name });
      return await sacrament.save();
    },
    deleteSacrament: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Remove sacrament from all people
        await Person.updateMany(
          { sacraments: id },
          { $pull: { sacraments: id } }
        );
        await Catechumen.updateMany(
          { sacraments: id },
          { $pull: { sacraments: id } }
        );
        await Catechist.updateMany(
          { sacraments: id },
          { $pull: { sacraments: id } }
        );

        // Delete the sacrament
        const result = await Sacrament.findByIdAndDelete(id);
        if (!result) {
          throw new Error("Sacrament not found");
        }

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    updateSacrament: async (_: any, { id, name }: { id: string; name: string }) => {
      return await Sacrament.findByIdAndUpdate(id, { name }, { new: true });
    },
  },
};

export default sacramentResolvers;
