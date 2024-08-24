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
    catechists: [ID!]!
    location: ID!
    catechumens: [ID!]!
    people: [ID!]!
    observations: String
  }

  extend type Query {
    getSurvey(id: ID!): Survey
    getSurveys: [Survey]
  }

  extend type Mutation {
    createSurvey(input: SurveyInput!): Survey
    deleteSurvey(id: ID!): Boolean
    deleteAllSurveys(passkey: String!): DeleteSurveysResponse!
    updateSurvey(id: ID!, input: SurveyInput!): Survey
  }

  type DeleteSurveysResponse {
    success: Boolean!
    message: String!
  }
`;
