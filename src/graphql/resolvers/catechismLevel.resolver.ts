import { Course } from "../models/course.model.js";
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
      const session = await CatechismLevel.startSession();
      session.startTransaction();

      try {
        // Check if there are any courses using this catechism level
        const coursesUsingLevel = await Course.countDocuments({ catechismLevel: id });

        if (coursesUsingLevel > 0) {
          throw new Error(`Cannot delete catechism level. It is being used by ${coursesUsingLevel} course(s).`);
        }

        // If no courses are using this level, proceed with deletion
        const result = await CatechismLevel.findByIdAndDelete(id).session(session);

        if (!result) {
          throw new Error('Catechism level not found');
        }

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        console.error('Error deleting catechism level:', error);
        throw error;
      } finally {
        session.endSession();
      }
    },
  },
};

export default catechismLevelResolvers;