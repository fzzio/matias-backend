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
      const course = new Course(input);
      return await course.save();
    },
    updateCourse: async (_: any, { id, input }: { id: string; input: CourseInput }) => {
      return await Course.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate("catechismLevel location catechists catechizands");
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      const result = await Course.findByIdAndDelete(id);
      return !!result;
    },
    assignCatechistToCourse: async (_: any, { courseId, catechistId }: { courseId: string; catechistId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $addToSet: { catechists: catechistId } }, { new: true }).populate("catechismLevel location catechists catechizands");
    },
    removeCatechistFromCourse: async (_: any, { courseId, catechistId }: { courseId: string; catechistId: string }) => {
      return await Course.findByIdAndUpdate(courseId, { $pull: { catechists: catechistId } }, { new: true }).populate("catechismLevel location catechists catechizands");
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