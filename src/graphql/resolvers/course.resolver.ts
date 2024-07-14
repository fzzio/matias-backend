import { Course } from "../models/course.model.js";
import { Person } from "../models/person.model.js";
import { CatechismLevel } from "../models/catechismLevel.model.js";
import { Location } from "../models/location.model.js";

const courseResolvers = {
  Query: {
    getCourses: async () => await Course.find().populate("catechismLevel location catechists catechizands"),
    getCourse: async (_: any, { id }: { id: string }) => await Course.findById(id).populate("catechismLevel location catechists catechizands"),
  },
  Mutation: {
    createCourse: async (_: any, { input }: { input: CourseInput }) => {
      const catechismLevel = await CatechismLevel.findById(input.catechismLevel);
      if (!catechismLevel) throw new Error("Invalid catechism level");

      const location = await Location.findById(input.location);
      if (!location) throw new Error("Invalid location");

      const catechists = await Person.find({ _id: { $in: input.catechists }, isCatechist: true });
      if (catechists.length !== input.catechists.length) throw new Error("Invalid catechist(s)");

      if (input.catechizands) {
        const catechizands = await Person.find({ _id: { $in: input.catechizands } });
        if (catechizands.length !== input.catechizands.length) throw new Error("Invalid catechizand(s)");
      }

      const course = new Course(input);
      await course.save();

      await Person.updateMany(
        { _id: { $in: input.catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (input.catechizands) {
        await Person.updateMany(
          { _id: { $in: input.catechizands } },
          { $addToSet: { coursesAsCatechizand: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechizands");
    },
    updateCourse: async (_: any, { id, input }: { id: string; input: CourseInput }) => {
      const catechismLevel = await CatechismLevel.findById(input.catechismLevel);
      if (!catechismLevel) throw new Error("Invalid catechism level");

      const location = await Location.findById(input.location);
      if (!location) throw new Error("Invalid location");

      const catechists = await Person.find({ _id: { $in: input.catechists }, isCatechist: true });
      if (catechists.length !== input.catechists.length) throw new Error("Invalid catechist(s)");

      if (input.catechizands) {
        const catechizands = await Person.find({ _id: { $in: input.catechizands } });
        if (catechizands.length !== input.catechizands.length) throw new Error("Invalid catechizand(s)");
      }

      const course = await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!course) throw new Error("Course not found");

      await Person.updateMany(
        { _id: { $in: input.catechists } },
        { $addToSet: { coursesAsCatechist: course._id } }
      );

      if (input.catechizands) {
        await Person.updateMany(
          { _id: { $in: input.catechizands } },
          { $addToSet: { coursesAsCatechizand: course._id } }
        );
      }

      return course.populate("catechismLevel location catechists catechizands");
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      const result = await Course.findByIdAndDelete(id);
      return !!result;
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

      return course.populate("catechismLevel location catechists catechizands");
    },
    removeCatechistFromCourse: async (_: any, { courseId, catechistId }: { courseId: string; catechistId: string }) => {
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { catechists: catechistId } },
        { new: true, runValidators: true }
      );
      if (!course) throw new Error("Course not found");

      await Person.findByIdAndUpdate(catechistId, { $pull: { coursesAsCatechist: courseId } });

      return course.populate("catechismLevel location catechists catechizands");
    },
    addCatechizandToCourse: async (_: any, { courseId, catechizandId }: { courseId: string; catechizandId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $addToSet: { catechizands: catechizandId } }, { new: true }).populate("catechismLevel location catechists catechizands");
    },
    removeCatechizandFromCourse: async (_: any, { courseId, catechizandId }: { courseId: string; catechizandId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $pull: { catechizands: catechizandId } }, { new: true }).populate("catechismLevel location catechists catechizands");
    },
  },
};

export interface CourseInput {
  year: string;
  catechismLevel: string;
  location: string;
  catechists: string[];
  catechizands?: string[];
}

export default courseResolvers;