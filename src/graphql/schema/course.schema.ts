export const courseTypeDefs = `#graphql
  type Course {
    id: ID!
    year: String!
    catechismLevel: CatechismLevel!
    location: Location!
    catechists: [Person!]!
    catechizands: [Person!]
    createdAt: String
    updatedAt: String
  }

  input CourseInput {
    year: String!
    catechismLevel: ID!
    location: ID!
    catechists: [ID!]!
    catechizands: [ID!]
  }

  extend type Query {
    getCourses: [Course]
    getCourse(id: ID!): Course
  }

  extend type Mutation {
    createCourse(input: CourseInput!): Course
    updateCourse(id: ID!, input: CourseInput!): Course
    deleteCourse(id: ID!): Boolean
    addCatechistToCourse(courseId: ID!, catechistId: ID!): Course
    removeCatechistFromCourse(courseId: ID!, catechistId: ID!): Course
    addCatechizandToCourse(courseId: ID!, catechizandId: ID!): Course
    removeCatechizandFromCourse(courseId: ID!, catechizandId: ID!): Course
  }
`;
