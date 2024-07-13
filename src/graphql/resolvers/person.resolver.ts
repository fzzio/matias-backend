import { Person } from "../models/person.model.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find().populate("sacraments"),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id).populate("sacraments"),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }).populate("sacraments"),
    getCatechists: async () => await Person.find({ isCatechist: true }).populate("sacraments"),
    getCatechizands: async () => await Person.find({ isCatechist: false }).populate("sacraments"),
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const person = new Person(input);
      return await person.save();
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate("sacraments");
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const result = await Person.findByIdAndDelete(id);
      return !!result;
    },
    addSacramentToPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $addToSet: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    removeSacramentFromPerson: async (_: any, { personId, sacramentId }: { personId: string; sacramentId: string }) => {
      return await Person.findByIdAndUpdate(personId, { $pull: { sacraments: sacramentId } }, { new: true }).populate("sacraments");
    },
    setCatechistStatus: async (_: any, { personId, isCatechist }: { personId: string; isCatechist: boolean }) => {
      return await Person.findByIdAndUpdate(personId, { isCatechist }, { new: true }).populate("sacraments");
    },
  },
};

export interface PersonInput {
  idCard?: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  sacraments?: string[];
  isCatechist?: boolean;
}

export default personResolvers;
