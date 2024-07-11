import { Location } from "../models/Location.js";

const locationResolvers = {
  Query: {
    locations: async () => await Location.find(),
    location: async (_: any, { id }: { id: string }) => await Location.findById(id),
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