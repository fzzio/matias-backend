export const personTypeDefs = `#graphql
  type Person {
    id: ID!
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
    createdAt: String
    updatedAt: String
  }

  input PersonInput {
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
  }

  extend type Query {
    getPeople: [Person]
    getPerson(id: ID!): Person
    getPersonByIdCard(idCard: String!): Person
  }

  extend type Mutation {
    createPerson(input: PersonInput!): Person
    updatePerson(id: ID!, input: PersonInput!): Person
    deletePerson(id: ID!): Boolean
  }
`;
