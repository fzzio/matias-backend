export const catechistTypeDefs = `#graphql
  type Catechist {
    id: ID!
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
    sacraments: [Sacrament!]
    coursesAsCatechist: [Course!]
    createdAt: String
    updatedAt: String
  }

  input CatechistInput {
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
    age: Int
    sacraments: [ID!]
  }

  extend type Query {
    getCatechist(id: ID!): Catechist
    getCatechistByIdCard(idCard: String!): Catechist
    getCatechists: [Catechist]
  }

  extend type Mutation {
    addSacramentToCatechist(catechistId: ID!, sacramentId: ID!): Catechist
    createCatechist(input: CatechistInput!): Catechist
    createCatechistsBulk(input: [CatechistInput!]!): [Catechist]
    deleteCatechist(id: ID!): Boolean
    deleteCatechistsBulk(ids: [ID!]!): Int
    removeSacramentFromCatechist(catechistId: ID!, sacramentId: ID!): Catechist
    updateCatechist(id: ID!, input: CatechistInput!): Catechist
  }
`;
