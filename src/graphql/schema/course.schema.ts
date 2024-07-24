export const courseTypeDefs = `#graphql
  type Course {
    id: ID!
    year: String!
    catechismLevel: CatechismLevel!
    location: Location!
    catechists: [Person!]!
    catechumens: [Person!]
    createdAt: String
    updatedAt: String
  }

  input CourseInput {
    year: String!
    catechismLevel: ID!
    location: ID!
    catechists: [ID!]!
    catechumens: [ID!]
  }

  extend type Query {
    getCourses: [Course]
    getCourse(id: ID!): Course
  }

  extend type Mutation {
    createCourse(input: CourseInput!): Course
    updateCourse(id: ID!, input: CourseInput!): Course
    deleteCourse(id: ID!): Boolean
    assignCatechistToCourse(courseId: ID!, catechistId: ID!): Course
    removeCatechistFromCourse(courseId: ID!, catechistId: ID!): Course
    addCatechumenToCourse(courseId: ID!, catechumenId: ID!): Course
    removeCatechumenFromCourse(courseId: ID!, catechumenId: ID!): Course
  }
`;
