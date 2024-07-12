export const locationTypeDefs = `#graphql
  type Location {
    id: ID!
    name: String!
  }

  extend type Query {
    getLocations: [Location]
    getLocation(id: ID!): Location
  }

  extend type Mutation {
    createLocation(name: String!): Location
    updateLocation(id: ID!, name: String!): Location
    deleteLocation(id: ID!): Boolean
  }
`;