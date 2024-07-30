import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Location } from "../models/location.model.js";

const locationResolvers = {
  Query: {
    getLocation: async (_: any, { id }: { id: string }) => await Location.findById(id),
    getLocations: async () => await Location.find(),
  },
  Mutation: {
    createLocation: async (_: any, { name }: { name: string }) => {
      const location = new Location({ name });
      return await location.save();
    },
    deleteLocation: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Check if the location is being used by any course
        const coursesUsingLocation = await Course.countDocuments({ location: id });
        if (coursesUsingLocation > 0) {
          throw new Error(`Cannot delete location. It is being used by ${coursesUsingLocation} course(s).`);
        }

        // Delete the location
        const result = await Location.findByIdAndDelete(id);
        if (!result) {
          throw new Error("Location not found");
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
    updateLocation: async (_: any, { id, name }: { id: string; name: string }) => {
      return await Location.findByIdAndUpdate(id, { name }, { new: true });
    },
  },
};

export default locationResolvers;
