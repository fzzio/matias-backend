export const locationTypeDefs = `#graphql
  type Location {
    id: ID!
    name: String!
  }

  extend type Query {
    getLocation(id: ID!): Location
    getLocations: [Location]
  }

  extend type Mutation {
    createLocation(name: String!): Location
    deleteLocation(id: ID!): Boolean
    updateLocation(id: ID!, name: String!): Location
  }
`;
