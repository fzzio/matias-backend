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
    missingSacraments: [Sacrament!]
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
    missingSacraments: [ID!]
    isVolunteer: Boolean
  }

  extend type Query {
    getPeople: [Person]
    getPeopleByYear(year: String!): [Person]
    getPerson(id: ID!): Person
    getPersonByIdCard(idCard: String!): Person
    getVolunteers: [Person]
  }

  extend type Mutation {
    addSacramentToPerson(personId: ID!, sacramentId: ID!): Person
    createPeopleBulk(input: [PersonInput!]!): [Person]
    createPerson(input: PersonInput!): Person
    deletePeopleBulk(ids: [ID!]!): Int
    deletePerson(id: ID!): Boolean
    removeSacramentFromPerson(personId: ID!, sacramentId: ID!): Person
    updatePerson(id: ID!, input: PersonInput!): Person
  }
`;
