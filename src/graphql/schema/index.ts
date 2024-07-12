import { locationTypeDefs } from "./location.schema.js";
import { sacramentTypeDefs } from "./sacrament.schema.js";

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
  ${locationTypeDefs}
  ${sacramentTypeDefs}
`;
