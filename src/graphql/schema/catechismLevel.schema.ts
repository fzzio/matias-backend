export const catechismLevelTypeDefs = `#graphql
  type CatechismLevel {
    id: ID!
    name: String!
  }

  extend type Query {
    getCatechismLevel(id: ID!): CatechismLevel
    getCatechismLevels: [CatechismLevel]
  }

  extend type Mutation {
    createCatechismLevel(name: String!): CatechismLevel
    deleteCatechismLevel(id: ID!): Boolean
    updateCatechismLevel(id: ID!, name: String!): CatechismLevel
  }
`;