export const sacramentTypeDefs = `#graphql
  type Sacrament {
    id: ID!
    name: String!
  }

  extend type Query {
    getSacraments: [Sacrament]
    getSacrament(id: ID!): Sacrament
  }

  extend type Mutation {
    createSacrament(name: String!): Sacrament
    updateSacrament(id: ID!, name: String!): Sacrament
    deleteSacrament(id: ID!): Boolean
  }
`;