import catechismLevelResolvers from "./catechismLevel.resolver.js";
import catechistResolvers from "./catechist.resolver.js";
import catechumenResolvers from "./catechumen.resolver.js";
import courseResolvers from "./course.resolver.js";
import locationResolvers from "./location.resolver.js";
import personResolvers from "./person.resolver.js";
import sacramentResolvers from "./sacrament.resolver.js";
import surveyResolvers from "./survey.resolver.js";

export const resolvers = {
  Query: {
    ...catechismLevelResolvers.Query,
    ...catechistResolvers.Query,
    ...catechumenResolvers.Query,
    ...courseResolvers.Query,
    ...locationResolvers.Query,
    ...personResolvers.Query,
    ...sacramentResolvers.Query,
    ...surveyResolvers.Query,
  },
  Mutation: {
    ...catechismLevelResolvers.Mutation,
    ...catechistResolvers.Mutation,
    ...catechumenResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...personResolvers.Mutation,
    ...sacramentResolvers.Mutation,
    ...surveyResolvers.Mutation,
  },
};
