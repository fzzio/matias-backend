import mongoose from "mongoose";

import { Survey } from "../models/survey.model.js";
import { Person } from "../models/person.model.js";

const surveyResolvers = {
  Query: {
    getSurveys: async () => await Survey.find().populate("catechumensInHousehold nonParticipants"),
    getSurvey: async (_: any, { id }: { id: string }) => await Survey.findById(id).populate("catechumensInHousehold nonParticipants"),
  },
  Mutation: {
    createSurvey: async (_: any, { input }: { input: SurveyInput }) => {
      try {
        const survey = new Survey({
          ...input,
          nonParticipants: input.nonParticipants,
          catechumensInHousehold: input.catechumensInHousehold,
          catechists: input.catechists,
          location: input.location
        });

        await survey.save();
        return await Survey.findById(survey._id)
          .populate("nonParticipants catechumensInHousehold catechists location")
          .exec();
      } catch (error) {
        throw error;
      }
    },
    updateSurvey: async (_: any, { id, input }: { id: string; input: SurveyInput }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Validate that all person IDs exist
        const allPersonIds = [...input.catechumensInHousehold, ...input.nonParticipants];
        const existingPersons = await Person.find({ _id: { $in: allPersonIds } });

        if (existingPersons.length !== allPersonIds.length) {
          throw new Error("One or more person IDs are invalid");
        }

        const updatedSurvey = await Survey.findByIdAndUpdate(id, input, { new: true, session }).populate("catechumensInHousehold nonParticipants");

        if (!updatedSurvey) {
          throw new Error("Survey not found");
        }

        await session.commitTransaction();
        return updatedSurvey;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
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
  },
};

export interface SurveyInput {
  householdSize: number;
  catechumensInHousehold: string[];
  nonParticipants: string[];
  observations?: string;
  catechists: string[];
  location: string;
}

export default surveyResolvers;
