import { Location } from "../models/location.model.js";

const locationResolvers = {
  Query: {
    getLocations: async () => await Location.find(),
    getLocation: async (_: any, { id }: { id: string }) => await Location.findById(id),
  },
  Mutation: {
    createLocation: async (_: any, { name }: { name: string }) => {
      const location = new Location({ name });
      return await location.save();
    },
    updateLocation: async (_: any, { id, name }: { id: string; name: string }) => {
      return await Location.findByIdAndUpdate(id, { name }, { new: true });
    },
    deleteLocation: async (_: any, { id }: { id: string }) => {
      const result = await Location.findByIdAndDelete(id);
      return !!result;
    },
  },
};

export default locationResolvers;