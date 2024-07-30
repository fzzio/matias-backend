import mongoose from "mongoose";

import { Course } from "../models/course.model.js";
import { CatechismLevel } from "../models/catechismLevel.model.js";
import { Catechist } from "../models/catechist.model.js";
import { Catechumen } from "../models/catechumen.model.js";
import { Location } from "../models/location.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";
import { CatechumenInput } from "./catechumen.resolver.js";

const courseResolvers = {
  Query: {
    getCourse: async (_: any, { id }: { id: string }) => await Course.findById(id).populate("catechismLevel location catechists catechumens"),
    getCourses: async () => await Course.find().populate("catechismLevel location catechists catechumens"),
  },
  Mutation: {
    assignCatechistToCourse: async (_: any, { courseId, catechistId }: { courseId: string, catechistId: string }) => {
      const catechist = await Catechist.findById(catechistId);
      if (!catechist) throw new Error("Invalid catechist");

      const course = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { catechists: catechistId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Catechist.findByIdAndUpdate(catechistId, { $addToSet: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechists");
    },
    assignCatechumenToCourse: async (_: any, { courseId, catechumenId }: { courseId: string, catechumenId: string }) => {
      const catechumen = await Catechumen.findById(catechumenId);
      if (!catechumen) throw new Error("Invalid catechumen");

      const course = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { catechumens: catechumenId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Catechist.findByIdAndUpdate(catechumenId, { $addToSet: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechumens");
    },
    createAndAssignCatechumensToCourse: async (_: any, { courseId, catechumens }: { courseId: string, catechumens: CatechumenInput[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const createdCatechumens = await Promise.all(
          catechumens.map(async (catechumenData) => {
            const { age, ...rest } = catechumenData;
            if (!rest.birthDate && age !== undefined) {
              rest.birthDate = generateBirthDateFromAge(parseInt(age));
            }
            const catechumen = new Catechumen(rest);
            await catechumen.save({ session });
            return catechumen;
          })
        );

        const catechumenIds = createdCatechumens.map(c => c._id);

        course.catechumens.push(...catechumenIds);
        await course.save({ session });

        await Catechumen.updateMany(
          { _id: { $in: catechumenIds } },
          { $addToSet: { coursesAsCatechumen: courseId } },
          { session }
        );

        await session.commitTransaction();
        return course.populate("catechismLevel location catechumens");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    createCourse: async (_: any, { input }: { input: CourseInput }) => {
      const { catechismLevel, location, catechists, catechumens } = input;

      const [validCatechismLevel, validLocation, validCatechists] = await Promise.all([
        CatechismLevel.findById(catechismLevel),
        Location.findById(location),
        Catechist.find({ _id: { $in: catechists } }),
      ]);

      if (!validCatechismLevel) throw new Error("Invalid catechism level");
      if (!validLocation) throw new Error("Invalid location");
      if (validCatechists.length !== catechists.length) throw new Error("Invalid catechist(s)");

      if (catechumens) {
        const validCatechumens = await Catechumen.find({ _id: { $in: catechumens } });
        if (validCatechumens.length !== catechumens.length) throw new Error("Invalid catechumen(s)");
      }

      const course = new Course(input);
      await course.save();

      await Catechist.updateMany(
        { _id: { $in: catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (catechumens) {
        await Catechumen.updateMany(
          { _id: { $in: catechumens } },
          { $addToSet: { coursesAsCatechumen: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechumens");
    },
    createCoursesBulk: async (_: any, { input }: { input: CourseInput[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();
        const courses = await Promise.all(input.map(async (courseInput) => {
          const course = new Course({
            year: courseInput.year,
            catechismLevel: courseInput.catechismLevel,
            room: courseInput.room,
            location: courseInput.location,
            description: courseInput.description,
            catechists: courseInput.catechists,
          });

          await course.save({ session });

          await Catechist.updateMany(
            { _id: { $in: courseInput.catechists } },
            { $push: { coursesAsCatechist: course._id } },
            { session }
          );

          return course.populate("catechismLevel location catechists");
        }));

        await session.commitTransaction();
        session.endSession();
        return courses;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const course = await Course.findById(id);
        if (!course) throw new Error("Course not found");

        await Catechist.updateMany(
          { coursesAsCatechist: id },
          { $pull: { coursesAsCatechist: id } }
        );
        await Catechumen.updateMany(
          { coursesAsCatechumen: id },
          { $pull: { coursesAsCatechumen: id } }
        );

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
    removeCatechistFromCourse: async (_: any, { courseId, catechistId }: { courseId: string, catechistId: string }) => {
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { catechists: catechistId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Catechist.findByIdAndUpdate(catechistId, { $pull: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechists catechumens");
    },
    removeCatechistsFromCourse: async (_: any, { courseId, catechistsIds }: { courseId: string, catechistsIds: string[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const course = await Course.findByIdAndUpdate(
          courseId,
          { $pull: { catechists: { $in: catechistsIds } } },
          { new: true, runValidators: true, session }
        );

        if (!course) throw new Error("Course not found");

        await Catechist.updateMany(
          { _id: { $in: catechistsIds } },
          { $pull: { coursesAsCatechist: courseId } },
          { session }
        );

        await session.commitTransaction();
        return course.populate("catechismLevel location catechists catechumens");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    removeCatechumenFromCourse: async (_: any, { courseId, catechumenId }: { courseId: string, catechumenId: string }) => {
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { catechumens: catechumenId } },
        { new: true }
      );
      if (!course) throw new Error("Course not found");

      await Catechumen.findByIdAndUpdate(catechumenId, { $pull: { coursesAsCatechumen: courseId } });

      return course.populate("catechismLevel location catechists catechumens");
    },
    removeCatechumensFromCourse: async (_: any, { courseId, catechumensIds }: { courseId: string, catechumensIds: string[] }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const course = await Course.findByIdAndUpdate(
          courseId,
          { $pull: { catechumens: { $in: catechumensIds } } },
          { new: true, runValidators: true, session }
        );

        if (!course) throw new Error("Course not found");

        await Catechumen.updateMany(
          { _id: { $in: catechumensIds } },
          { $pull: { coursesAsCatechumen: courseId } },
          { session }
        );

        await session.commitTransaction();
        return course.populate("catechismLevel location catechists catechumens");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    updateCourse: async (_: any, { id, input }: { id: string, input: CourseInput }) => {
      const { catechismLevel, location, catechists, catechumens } = input;

      const [validCatechismLevel, validLocation, validCatechists] = await Promise.all([
        CatechismLevel.findById(catechismLevel),
        Location.findById(location),
        Catechist.find({ _id: { $in: catechists } }),
      ]);

      if (!validCatechismLevel) throw new Error("Invalid catechism level");
      if (!validLocation) throw new Error("Invalid location");
      if (validCatechists.length !== catechists.length) throw new Error("Invalid catechist(s)");

      if (catechumens) {
        const validCatechumens = await Catechumen.find({ _id: { $in: catechumens } });
        if (validCatechumens.length !== catechumens.length) throw new Error("Invalid catechumen(s)");
      }

      const course = await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!course) throw new Error("Course not found");

      await Catechist.updateMany(
        { _id: { $in: catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (catechumens) {
        await Catechumen.updateMany(
          { _id: { $in: catechumens } },
          { $addToSet: { coursesAsCatechumen: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechumens");
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
