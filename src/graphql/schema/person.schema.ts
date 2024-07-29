export const personTypeDefs = `#graphql
  type Person {
    id: ID!
    idCard: String
    name: String!
    lastName: String!
    email: String
    phone: String
    birthDate: String
    sacraments: [Sacrament!]
    isCatechist: Boolean!
    isVolunteer: Boolean!
    coursesAsCatechist: [Course!]
    coursesAsCatechumen: [Course!]
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
    sacraments: [ID!]
    isCatechist: Boolean
    isVolunteer: Boolean
  }

  extend type Query {
    getPeople: [Person]
    getPerson(id: ID!): Person
    getPersonByIdCard(idCard: String!): Person
    getCatechists: [Person]
    getVolunteers: [Person]
    getCatechumens(year: String!): [Person]
    getCatechumensWithoutVisit(year: String!): [Person]
    getNonParticipants(year: String!): [Person]
  }

  extend type Mutation {
    createPerson(input: PersonInput!): Person
    createPeopleBulk(input: [PersonInput!]!): [Person]
    updatePerson(id: ID!, input: PersonInput!): Person
    deletePerson(id: ID!): Boolean
    deletePeopleBulk(ids: [ID!]!): Int
    addSacramentToPerson(personId: ID!, sacramentId: ID!): Person
    removeSacramentFromPerson(personId: ID!, sacramentId: ID!): Person
    updateCatechistStatus(personId: ID!, enable: Boolean!): Person
  }
`;
