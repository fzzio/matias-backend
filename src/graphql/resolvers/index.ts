import catechismLevelResolvers from "./catechismLevel.resolver.js";
import locationResolvers from "./location.resolver.js";
import personResolvers from "./person.resolver.js";
import sacramentResolvers from "./sacrament.resolver.js";
import courseResolvers from "./course.resolver.js";
import surveyResolvers from "./survey.resolver.js";

export const resolvers = {
  Query: {
    ...catechismLevelResolvers.Query,
    ...locationResolvers.Query,
    ...personResolvers.Query,
    ...sacramentResolvers.Query,
    ...courseResolvers.Query,
    ...surveyResolvers.Query,
  },
  Mutation: {
    ...catechismLevelResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...personResolvers.Mutation,
    ...sacramentResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...surveyResolvers.Mutation,
  },
};
