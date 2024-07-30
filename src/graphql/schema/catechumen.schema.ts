export const catechumenTypeDefs = `#graphql
  type Catechumen {
    id: ID!
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
    sacraments: [Sacrament!]
    coursesAsCatechumen: [Course!]
    createdAt: String
    updatedAt: String
  }

  input CatechumenInput {
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
    getCatechumen(id: ID!): Catechumen
    getCatechumenByIdCard(idCard: String!): Catechumen
    getCatechumens: [Catechumen]
    getCatechumensByYear(year: String!): [Catechumen]
    getCatechumensWithoutVisitByYear(year: String!): [Catechumen]
  }

  extend type Mutation {
    addSacramentToCatechumen(catechumenId: ID!, sacramentId: ID!): Catechumen
    createCatechumen(input: CatechumenInput!): Catechumen
    createCatechumensBulk(input: [CatechumenInput!]!): [Catechumen]
    deleteCatechumen(id: ID!): Boolean
    deleteCatechumensBulk(ids: [ID!]!): Int
    removeSacramentFromCatechumen(catechumenId: ID!, sacramentId: ID!): Catechumen
    updateCatechumen(id: ID!, input: CatechumenInput!): Catechumen
  }
`;
