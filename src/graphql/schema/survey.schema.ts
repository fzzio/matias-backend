export const surveyTypeDefs = `#graphql
  type Survey {
    id: ID!
    householdSize: Int!
    catechumensInHousehold: [Person!]!
    nonParticipants: [Person!]!
    observations: String
    catechists: [Person!]!
    location: Location!
    createdAt: String
    updatedAt: String
  }

  input SurveyInput {
    householdSize: Int!
    catechumensInHousehold: [ID!]!
    nonParticipants: [ID!]!
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