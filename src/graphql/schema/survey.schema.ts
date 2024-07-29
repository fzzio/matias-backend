export const surveyTypeDefs = `#graphql
  type Survey {
    id: ID!
    householdSize: Int!
    catechumens: [Catechumen!]!
    people: [Person!]!
    observations: String
    catechists: [Catechist!]!
    location: Location!
    createdAt: String
    updatedAt: String
  }

  input SurveyInput {
    householdSize: Int!
    catechumens: [ID!]!
    people: [ID!]!
    observations: String
    catechists: [ID!]!
    location: ID!
  }

  extend type Query {
    getSurveys: [Survey]
    getSurvey(id: ID!): Survey
  }

  extend type Mutation {
    createSurvey(input: SurveyInput!): Survey
    updateSurvey(id: ID!, input: SurveyInput!): Survey
    deleteSurvey(id: ID!): Boolean
  }
`;