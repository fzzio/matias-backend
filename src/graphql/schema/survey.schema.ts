export const surveyTypeDefs = `#graphql
  type Survey {
    id: ID!
    householdSize: Int!
    catechumensInHousehold: [Person!]!
    nonParticipants: [Person!]!
    observations: String
    createdAt: String
    updatedAt: String
  }

  input SurveyInput {
    householdSize: Int!
    catechumensInHousehold: [ID!]!
    nonParticipants: [ID!]!
    observations: String
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