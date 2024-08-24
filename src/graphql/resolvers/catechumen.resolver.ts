import mongoose, { Query, Types } from "mongoose";

import { Course } from "../models/course.model.js";
import { Catechumen } from "../models/catechumen.model.js";
import { Survey } from "../models/survey.model.js";
import { generateBirthDateFromAge } from "../../utils/calculate.js";

const populateCatechumenData = async <T>(query: Query<T, any>): Promise<T> => {
  try {
    return await query
      .populate("sacraments")
      .populate("location")
      .populate({
        path: 'coursesAsCatechumen',
        populate: [
          { path: 'catechismLevel' },
          { path: 'location' },
          { path: 'catechists' }
        ]
      });
  } catch (error) {
    console.error("[populateCatechumenData] - Error populating data:", error);
    throw error;
  }
};

const catechumenResolvers = {
  Query: {
    getCatechumen: async (_: any, { id }: { id: string }) => {
      return await populateCatechumenData(Catechumen.findById(id));
    },
    getCatechumenByIdCard: async (_: any, { idCard }: { idCard: string }) => {
      return await populateCatechumenData(Catechumen.findOne({ idCard }));
    },
    getCatechumens: async () => {
      return await populateCatechumenData(Catechumen.find());
    },
    getCatechumensByYear: async (_: any, { year }: { year: string }) => {
      const coursesOfYear = await Course.find({ year }).populate("catechumens");
      const catechumenIds = coursesOfYear.flatMap(course =>
        course.catechumens.map((catechumen: any) => catechumen.id)
      ).filter(Boolean);

      return await populateCatechumenData(Catechumen.find({ '_id': { $in: catechumenIds } }));
    },
    getCatechumensWithoutVisitByYear: async (_: any, { year }: { year: string }) => {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      const catechumenIdsWithSurvey: Types.ObjectId[] = await Survey.distinct("catechumens", {
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const allCatechumenIds = await Catechumen.find().distinct('_id');

      const catechumenIdsWithoutSurvey = allCatechumenIds.filter(
        (id: Types.ObjectId) => !catechumenIdsWithSurvey.some(
          (surveyId) => surveyId.equals(id)
        )
      );

      return await populateCatechumenData(Catechumen.find({ '_id': { $in: catechumenIdsWithoutSurvey } }));
    },
  },
  Mutation: {
    addSacramentToCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await populateCatechumenData(Catechumen.findByIdAndUpdate(catechumenId, { $addToSet: { sacraments: sacramentId } }, { new: true }));
    },
    createCatechumen: async (_: any, { input }: { input: CatechumenInput }) => {
      const { age, ...rest } = input;

      if (!rest.birthDate && age !== undefined) {
        rest.birthDate = generateBirthDateFromAge(parseInt(age));
      }
      const catechumen = new Catechumen(rest);
      await catechumen.save();
      return await populateCatechumenData(Catechumen.findById(catechumen.id));
    },
    createCatechumensBulk: async (_: any, { input }: { input: CatechumenInput[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const createdCatechumens = await Promise.all(
          input.map(async (catechumenData) => {
            const { age, ...rest } = catechumenData;
            if (!rest.birthDate && age !== undefined) {
              rest.birthDate = generateBirthDateFromAge(parseInt(age));
            }
            const catechumen = new Catechumen(rest);
            await catechumen.save({ session });
            return catechumen;
          })
        );

        await session.commitTransaction();
        return createdCatechumens;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteAllCatechumens: async (_: any, { passkey }: { passkey: string }) => {
      const session = await mongoose.startSession();

      if (passkey !== "DELETE_ALL_CATECHUMEN") {
        throw new Error("No autorizado para eliminar");
      }

      try {
        session.startTransaction();

        const allCatechumenIds = await Catechumen.find().distinct('_id');

        if (allCatechumenIds.length === 0) {
          throw new Error("No se encontraron catecúmenos para borrar");
        }

        await Course.updateMany(
          { catechumens: { $in: allCatechumenIds } },
          { $pull: { catechumens: { $in: allCatechumenIds } } }
        );

        await Survey.updateMany(
          { catechumens: { $in: allCatechumenIds } },
          { $pull: { catechumens: { $in: allCatechumenIds } } }
        );

        const result = await Catechumen.deleteMany({ _id: { $in: allCatechumenIds } });

        await session.commitTransaction();
        return {
          success: true,
          message: `Se han borrado ${result.deletedCount} catecúmenos y sus referencias asociadas.`,
        };
      } catch (error) {
        await session.abortTransaction();
        console.error("[deleteAllCatechumens] - Error deleting all catechumens:", error);
        throw new Error("Error al borrar todos los catecúmenos y sus referencias.");
      } finally {
        session.endSession();
      }
    },
    deleteCatechumen: async (_: any, { id }: { id: string }) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const catechumen = await Catechumen.findById(id);
        if (!catechumen) throw new Error("Catechumen not found");

        // Remove catechumen from all courses
        await Course.updateMany(
          { catechumens: id },
          { $pull: { catechumens: id } }
        );

        // Remove catechumen from all surveys
        await Survey.updateMany(
          { catechumens: id },
          { $pull: { catechumens: id } }
        );

        await Catechumen.findByIdAndDelete(id);

        await session.commitTransaction();
        return true;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteCatechumensBulk: async (_: any, { ids }: { ids: string[] }) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        // Remove catechumens from all courses
        await Course.updateMany(
          { catechumens: { $in: ids } },
          { $pull: { catechumens: { $in: ids } } }
        );

        // Remove catechumens from all surveys
        await Survey.updateMany(
          { catechumens: { $in: ids } },
          { $pull: { catechumens: { $in: ids } } }
        );

        const result = await Catechumen.deleteMany({ _id: { $in: ids } });

        await session.commitTransaction();
        return result.deletedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    removeSacramentFromCatechumen: async (_: any, { catechumenId, sacramentId }: { catechumenId: string; sacramentId: string }) => {
      return await populateCatechumenData(Catechumen.findByIdAndUpdate(catechumenId, { $pull: { sacraments: sacramentId } }, { new: true }));
    },
    updateCatechumen: async (_: any, { id, input }: { id: string; input: CatechumenInput }) => {
      if (!input.birthDate && input.age) {
        input.birthDate = generateBirthDateFromAge(parseInt(input.age));
      }
      return await populateCatechumenData(Catechumen.findByIdAndUpdate(id, input, { new: true, runValidators: true }));
    },
    updateCatechumensBulk: async (_: any, { input }: { input: CatechumenUpdateInput[] }) => {
      const updatedCatechumens = await Promise.all(
        input.map(async (updateData) => {
          const { id, age, ...rest } = updateData;

          if (!rest.birthDate && age !== undefined) {
            rest.birthDate = generateBirthDateFromAge(parseInt(age));
          }

          if (rest.location === "") {
            delete rest.location;
          }

          if (!Array.isArray(rest.sacraments)) {
            delete rest.sacraments;
          }

          const updatedCatechumen = populateCatechumenData(Catechumen.findByIdAndUpdate(id, rest, {
            new: true,
            runValidators: true,
          }));

          if (!updatedCatechumen) {
            throw new Error(`Catechumen with id ${id} not found`);
          }

          return updatedCatechumen;
        })
      );

      return updatedCatechumens;
    },
  },
};

export interface CatechumenInput {
  idCard?: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  age?: string;
  sacraments?: string[];
  coursesAsCatechumen?: string[];
  location?: string;
  address?: string;
}

export interface CatechumenUpdateInput extends CatechumenInput {
  id: string;
}

export default catechumenResolvers;
