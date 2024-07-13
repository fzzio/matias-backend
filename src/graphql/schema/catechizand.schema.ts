export const catechizandTypeDefs = `#graphql
  type Catechizand {
    id: ID!
    person: Person!
    course: Course!
    createdAt: String
    updatedAt: String
  }

  input CatechizandInput {
    person: ID!
    course: ID!
  }

  extend type Query {
    getCatechizands: [Catechizand]
    getCatechizand(id: ID!): Catechizand
  }

  extend type Mutation {
    createCatechizand(personId: ID!, courseId: ID!): Catechizand
    updateCatechizand(id: ID!, input: CatechizandInput!): Catechizand
    deleteCatechizand(id: ID!): Boolean
    updateCatechizandCourse(catechizandId: ID!, courseId: ID!): Catechizand
    createManyCatechizands(input: [CatechizandInput!]!): [Catechizand]
    deleteManyCatechizands(ids: [ID!]!): Int
  }
`;
