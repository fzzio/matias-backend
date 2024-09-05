import mongoose, { Query } from "mongoose";

import { Survey } from "../models/survey.model.js";

const populateSurveyData = async <T>(query: Query<T, any>): Promise<T> => {
  try {
    return await query
      .populate("location")
      .populate({
        path: 'catechumens',
        populate: [
          {
            path: 'coursesAsCatechumen',
            populate: [
              { path: 'catechismLevel' },
              { path: 'location' },
              { path: 'catechists' }
            ]
          },
          { path: 'location' },
          { path: 'sacraments' },
        ]
      })
      .populate({
        path: 'catechists',
        populate: [
          { path: 'sacraments' },
        ]
      })
      .populate({
        path: 'people',
        populate: [
          { path: 'sacraments' },
          { path: 'missingSacraments' },
        ]
      });
  } catch (error) {
    console.error("[populateSurveyData] - Error populating data:", error);
    throw error;
  }
};

const surveyResolvers = {
  Query: {
    getSurvey: async (_: any, { id }: { id: string }) => {
      return await populateSurveyData(Survey.findById(id));
    },
    getSurveys: async () => {
      return await populateSurveyData(Survey.find());
    },
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
    deleteAllSurveys: async (_: any, { passkey }: { passkey: string }) => {
      const session = await mongoose.startSession();

      if (passkey !== "DELETE_ALL_SURVEYS") {
        throw new Error("No autorizado para eliminar");
      }

      try {
        session.startTransaction();

        const allSurveyIds = await Survey.find().distinct('_id');

        if (allSurveyIds.length === 0) {
          throw new Error("No se encontraron encuestas para borrar");
        }

        const result = await Survey.deleteMany({ _id: { $in: allSurveyIds } });

        await session.commitTransaction();
        return {
          success: true,
          message: `Se han borrado ${result.deletedCount} surveys y sus referencias asociadas.`,
        };
      } catch (error) {
        await session.abortTransaction();
        console.error("[deleteAllSurveys] - Error deleting all surveys:", error);
        throw new Error("Error al borrar todos los encuestas y sus referencias.");
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
