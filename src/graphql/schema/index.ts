import { personTypeDefs } from "./person.schema.js";
import { catechistTypeDefs } from "./catechist.schema.js";
import { catechizandTypeDefs } from "./catechizand.schema.js";
import { courseTypeDefs } from "./course.schema.js";
import { sacramentTypeDefs } from "./sacrament.schema.js";
import { locationTypeDefs } from "./location.schema.js";
import { catechismLevelTypeDefs } from "./catechismLevel.schema.js";

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
  ${catechistTypeDefs}
  ${catechizandTypeDefs}
  ${courseTypeDefs}
  ${sacramentTypeDefs}
  ${locationTypeDefs}
  ${catechismLevelTypeDefs}
`;
