import { catechismLevelTypeDefs } from "./catechismLevel.schema.js";
import { catechistTypeDefs } from "./catechist.schema.js";
import { catechumenTypeDefs } from "./catechumen.schema.js";
import { courseTypeDefs } from "./course.schema.js";
import { locationTypeDefs } from "./location.schema.js";
import { personTypeDefs } from "./person.schema.js";
import { sacramentTypeDefs } from "./sacrament.schema.js";
import { surveyTypeDefs } from "./survey.schema.js";


const rootTypeDefs = `#graphql
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export const typeDefs = `#graphql
  ${catechismLevelTypeDefs}
  ${catechistTypeDefs}
  ${catechumenTypeDefs}
  ${courseTypeDefs}
  ${locationTypeDefs}
  ${personTypeDefs}
  ${rootTypeDefs}
  ${sacramentTypeDefs}
  ${surveyTypeDefs}
`;
