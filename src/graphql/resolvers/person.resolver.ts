import { Person } from "../models/person.model.js";

const personResolvers = {
  Query: {
    getPeople: async () => await Person.find(),
    getPerson: async (_: any, { id }: { id: string }) => await Person.findById(id),
    getPersonByIdCard: async (_: any, { idCard }: { idCard: string }) => await Person.findOne({ idCard }),
  },
  Mutation: {
    createPerson: async (_: any, { input }: { input: PersonInput }) => {
      const person = new Person(input);
      return await person.save();
    },
    updatePerson: async (_: any, { id, input }: { id: string; input: PersonInput }) => {
      return await Person.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    },
    deletePerson: async (_: any, { id }: { id: string }) => {
      const result = await Person.findByIdAndDelete(id);
      return !!result;
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
}

export default personResolvers;
