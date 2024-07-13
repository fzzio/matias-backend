import { Survey } from "../models/survey.model.js";

const surveyResolvers = {
  Query: {
    getSurveys: async () => await Survey.find().populate("catechizandsInHousehold nonParticipants"),
    getSurvey: async (_: any, { id }: { id: string }) => await Survey.findById(id).populate("catechizandsInHousehold nonParticipants"),
  },
  Mutation: {
    createSurvey: async (_: any, { input }: { input: SurveyInput }) => {
      const survey = new Survey(input);
      return await survey.save();
    },
    updateSurvey: async (_: any, { id, input }: { id: string; input: SurveyInput }) => {
      return await Survey.findByIdAndUpdate(id, input, { new: true }).populate("catechizandsInHousehold nonParticipants");
    },
    deleteSurvey: async (_: any, { id }: { id: string }) => {
      const result = await Survey.findByIdAndDelete(id);
      return !!result;
    },
  },
};

export interface SurveyInput {
  householdSize: number;
  catechizandsInHousehold: string[];
  nonParticipants: string[];
  observations: string;
}

export default surveyResolvers;
