import catechismLevelResolvers from "./catechismLevel.resolver.js";
import locationResolvers from "./location.resolver.js";
import personResolvers from "./person.resolver.js";
import sacramentResolvers from "./sacrament.resolver.js";

export const resolvers = {
  Query: {
    ...catechismLevelResolvers.Query,
    ...locationResolvers.Query,
    ...personResolvers.Query,
    ...sacramentResolvers.Query,
  },
  Mutation: {
    ...catechismLevelResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...personResolvers.Mutation,
    ...sacramentResolvers.Mutation,
  },
};
