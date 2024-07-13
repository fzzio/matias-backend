export const catechistTypeDefs = `#graphql
  type Catechist {
    id: ID!
    person: Person!
    courses: [Course!]
    createdAt: String
    updatedAt: String
  }

  input CatechistInput {
    person: ID!
    courses: [ID!]
  }

  extend type Query {
    getCatechists: [Catechist]
    getCatechist(id: ID!): Catechist
  }

  extend type Mutation {
    createCatechist(personId: ID!): Catechist
    updateCatechist(id: ID!, input: CatechistInput!): Catechist
    deleteCatechist(id: ID!): Boolean
    addCourseToCatechist(catechistId: ID!, courseId: ID!): Catechist
    removeCoursFromCatechist(catechistId: ID!, courseId: ID!): Catechist
    createManyCatechists(input: [CatechistInput!]!): [Catechist]
    deleteManyCatechists(ids: [ID!]!): Int
  }
`;