import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";
import { CatechismLevel } from "../models/catechismLevel.model.js";
import { Location } from "../models/location.model.js";

const courseResolvers = {
  Query: {
    getCourses: async () => await Course.find().populate("catechismLevel location catechists catechumens"),
    getCourse: async (_: any, { id }: { id: string }) => await Course.findById(id).populate("catechismLevel location catechists catechumens"),
  },
  Mutation: {
    createCourse: async (_: any, { input }: { input: CourseInput }) => {
      const catechismLevel = await CatechismLevel.findById(input.catechismLevel);
      if (!catechismLevel) throw new Error("Invalid catechism level");

      const location = await Location.findById(input.location);
      if (!location) throw new Error("Invalid location");

      const catechists = await Person.find({ _id: { $in: input.catechists }, isCatechist: true });
      if (catechists.length !== input.catechists.length) throw new Error("Invalid catechist(s)");

      if (input.catechumens) {
        const catechumens = await Person.find({ _id: { $in: input.catechumens } });
        if (catechumens.length !== input.catechumens.length) throw new Error("Invalid catechumen(s)");
      }

      const course = new Course(input);
      await course.save();

      await Person.updateMany(
        { _id: { $in: input.catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (input.catechumens) {
        await Person.updateMany(
          { _id: { $in: input.catechumens } },
          { $addToSet: { coursesAsCatechumen: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechumens");
    },
    createCoursesBulk: async (_: any, { input }: { input: CourseInput[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const createdCourses = [];

        for (const courseInput of input) {
          const catechismLevel = await CatechismLevel.findById(courseInput.catechismLevel);
          if (!catechismLevel) throw new Error(`Invalid catechism level for course: ${courseInput.year} - ${courseInput.room}`);

          const location = await Location.findById(courseInput.location);
          if (!location) throw new Error(`Invalid location for course: ${courseInput.year} - ${courseInput.room}`);

          const catechists = await Person.find({ _id: { $in: courseInput.catechists }, isCatechist: true });
          if (catechists.length !== courseInput.catechists.length) throw new Error(`Invalid catechist(s) for course: ${courseInput.year} - ${courseInput.room}`);

          if (courseInput.catechumens) {
            const catechumens = await Person.find({ _id: { $in: courseInput.catechumens } });
            if (catechumens.length !== courseInput.catechumens.length) throw new Error(`Invalid catechumen(s) for course: ${courseInput.year} - ${courseInput.room}`);
          }

          const course = new Course(courseInput);
          await course.save();

          await Person.updateMany(
            { _id: { $in: courseInput.catechists } },
            { $addToSet: { coursesAsCatechist: course._id } }
          );

          if (courseInput.catechumens) {
            await Person.updateMany(
              { _id: { $in: courseInput.catechumens } },
              { $addToSet: { coursesAsCatechumen: course._id } }
            );
          }

          createdCourses.push(await course.populate("catechismLevel location catechists catechumens"));
        }

        await session.commitTransaction();
        return createdCourses;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    updateCourse: async (_: any, { id, input }: { id: string; input: CourseInput }) => {
      const catechismLevel = await CatechismLevel.findById(input.catechismLevel);
      if (!catechismLevel) throw new Error("Invalid catechism level");

      const location = await Location.findById(input.location);
      if (!location) throw new Error("Invalid location");

      const catechists = await Person.find({ _id: { $in: input.catechists }, isCatechist: true });
      if (catechists.length !== input.catechists.length) throw new Error("Invalid catechist(s)");

      if (input.catechumens) {
        const catechumens = await Person.find({ _id: { $in: input.catechumens } });
        if (catechumens.length !== input.catechumens.length) throw new Error("Invalid catechumen(s)");
      }

      const course = await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!course) throw new Error("Course not found");

      await Person.updateMany(
        { _id: { $in: input.catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (input.catechumens) {
        await Person.updateMany(
          { _id: { $in: input.catechumens } },
          { $addToSet: { coursesAsCatechumen: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechumens");
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const course = await Course.findById(id);
        if (!course) throw new Error("Course not found");

        // Remove course from people
        await Person.updateMany(
          { $or: [{ coursesAsCatechist: id }, { coursesAsCatechumen: id }] },
          { $pull: { coursesAsCatechist: id, coursesAsCatechumen: id } }
        );

        // Delete the course
        await Course.findByIdAndDelete(id);

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    assignCatechistToCourse: async (_: any, { courseId, catechistId }: { courseId: string; catechistId: string }) => {
      const person = await Person.findById(catechistId);
      if (!person || !person.isCatechist) throw new Error("Invalid catechist");

      const course = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { catechists: catechistId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Person.findByIdAndUpdate(catechistId, { $addToSet: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechists catechumens");
    },
    removeCatechistFromCourse: async (_: any, { courseId, catechistId }: { courseId: string; catechistId: string }) => {
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { catechists: catechistId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Person.findByIdAndUpdate(catechistId, { $pull: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechists catechumens");
    },
    addCatechumenToCourse: async (_: any, { courseId, catechumenId }: { courseId: string; catechumenId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $addToSet: { catechumens: catechumenId } }, { new: true }).populate("catechismLevel location catechists catechumens");
    },
    removeCatechumenFromCourse: async (_: any, { courseId, catechumenId }: { courseId: string; catechumenId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $pull: { catechumens: catechumenId } }, { new: true }).populate("catechismLevel location catechists catechumens");
    },
  },
};

export interface CourseInput {
  year: string;
  room: string;
  description: string;
  catechismLevel: string;
  location: string;
  catechists: string[];
  catechumens?: string[];
}

export default courseResolvers;