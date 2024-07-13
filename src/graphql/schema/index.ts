import { personTypeDefs } from "./person.schema.js";
import { courseTypeDefs } from "./course.schema.js";
import { sacramentTypeDefs } from "./sacrament.schema.js";
import { locationTypeDefs } from "./location.schema.js";
import { catechismLevelTypeDefs } from "./catechismLevel.schema.js";
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
  ${rootTypeDefs}
  ${personTypeDefs}
  ${courseTypeDefs}
  ${sacramentTypeDefs}
  ${locationTypeDefs}
  ${catechismLevelTypeDefs}
  ${surveyTypeDefs}
`;
