import mongoose from "mongoose";

import { Survey } from "../models/survey.model.js";

const surveyResolvers = {
  Query: {
    getSurvey: async (_: any, { id }: { id: string }) => await Survey.findById(id).populate("catechumens catechists people"),
    getSurveys: async () => await Survey.find().populate("catechumens catechists people"),
  },
  Mutation: {
    createSurvey: async (_: any, { input }: { input: SurveyInput }) => {
      try {
        const survey = new Survey({
          ...input,
          people: input.people,
          catechumens: input.catechumens,
          catechists: input.catechists,
          location: input.location
        });

        await survey.save();
        return await Survey.findById(survey._id)
          .populate("people catechumens catechists location")
          .exec();
      } catch (error) {
        throw error;
      }
    },
    deleteSurvey: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const deletedSurvey = await Survey.findByIdAndDelete(id).session(session);

        if (!deletedSurvey) {
          throw new Error("Survey not found");
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
    updateSurvey: async (_: any, { id, input }: { id: string; input: SurveyInput }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const survey = await Survey.findByIdAndUpdate(
          id,
          { ...input },
          { new: true, runValidators: true, session }
        );

        if (!survey) throw new Error("Survey not found");

        await session.commitTransaction();
        return survey.populate("catechumens catechists people location");
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
  },
};

export interface SurveyInput {
  householdSize: number;
  catechumens: string[];
  people: string[];
  observations?: string;
  catechists: string[];
  location: string;
}

export default surveyResolvers;
