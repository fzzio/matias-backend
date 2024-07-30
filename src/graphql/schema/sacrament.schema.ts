export const sacramentTypeDefs = `#graphql
  type Sacrament {
    id: ID!
    name: String!
  }

  extend type Query {
    getSacrament(id: ID!): Sacrament
    getSacraments: [Sacrament]
  }

  extend type Mutation {
    createSacrament(name: String!): Sacrament
    deleteSacrament(id: ID!): Boolean
    updateSacrament(id: ID!, name: String!): Sacrament
  }
`;
