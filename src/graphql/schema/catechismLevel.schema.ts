export const catechismLevelTypeDefs = `#graphql
  type CatechismLevel {
    id: ID!
    name: String!
  }

  extend type Query {
    getCatechismLevels: [CatechismLevel]
    getCatechismLevel(id: ID!): CatechismLevel
  }

  extend type Mutation {
    createCatechismLevel(name: String!): CatechismLevel
    updateCatechismLevel(id: ID!, name: String!): CatechismLevel
    deleteCatechismLevel(id: ID!): Boolean
  }
`;