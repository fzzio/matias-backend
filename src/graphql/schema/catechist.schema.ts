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
    getCatechists: [Catechist]
    getCatechist(id: ID!): Catechist
    getCatechistByIdCard(idCard: String!): Catechist
  }

  extend type Mutation {
    createCatechist(input: CatechistInput!): Catechist
    createCatechistsBulk(input: [CatechistInput!]!): [Catechist]
    updateCatechist(id: ID!, input: CatechistInput!): Catechist
    deleteCatechist(id: ID!): Boolean
    deleteCatechistsBulk(ids: [ID!]!): Int
    addSacramentToCatechist(catechistId: ID!, sacramentId: ID!): Catechist
    removeSacramentFromCatechist(catechistId: ID!, sacramentId: ID!): Catechist
  }
`;
