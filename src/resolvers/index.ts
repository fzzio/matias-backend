import locationResolvers from "./locationResolvers.js";

export const resolvers = {
  Query: {
    ...locationResolvers.Query,
  },
  Mutation: {
    ...locationResolvers.Mutation,
  },
};
