import locationResolvers from "./location.resolver.js";

export const resolvers = {
  Query: {
    ...locationResolvers.Query,
  },
  Mutation: {
    ...locationResolvers.Mutation,
  },
};
