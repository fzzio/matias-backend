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
    isVolunteer: Boolean!
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
    age: Int
    sacraments: [ID!]
    isVolunteer: Boolean
  }

  extend type Query {
    getPeople: [Person]
    getPerson(id: ID!): Person
    getPersonByIdCard(idCard: String!): Person
    getVolunteers: [Person]
    getPeopleByYear(year: String!): [Person]
  }

  extend type Mutation {
    createPerson(input: PersonInput!): Person
    createPeopleBulk(input: [PersonInput!]!): [Person]
    updatePerson(id: ID!, input: PersonInput!): Person
    deletePerson(id: ID!): Boolean
    deletePeopleBulk(ids: [ID!]!): Int
    addSacramentToPerson(personId: ID!, sacramentId: ID!): Person
    removeSacramentFromPerson(personId: ID!, sacramentId: ID!): Person
  }
`;
