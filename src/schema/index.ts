import { locationTypeDefs } from "./location.js";
import { sacramentTypeDefs } from "./sacrament.js";

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

// export const typeDefs = [rootTypeDefs, locationTypeDefs, sacramentTypeDefs];
