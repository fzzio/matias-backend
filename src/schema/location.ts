export const locationTypeDefs = `#graphql
  type Location {
    id: ID!
    name: String!
  }

  extend type Query {
    locations: [Location]
    location(id: ID!): Location
  }

  extend type Mutation {
    createLocation(name: String!): Location
    updateLocation(id: ID!, name: String!): Location
    deleteLocation(id: ID!): Boolean
  }
`;