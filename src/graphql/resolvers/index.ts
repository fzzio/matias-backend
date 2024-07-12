import locationResolvers from "./location.resolver.js";
import sacramentResolvers from "./sacrament.resolver.js";

export const resolvers = {
  Query: {
    ...locationResolvers.Query,
    ...sacramentResolvers.Query,
  },
  Mutation: {
    ...locationResolvers.Mutation,
    ...sacramentResolvers.Mutation,
  },
};
