export const courseTypeDefs = `#graphql
  type Course {
    id: ID!
    year: String!
    room: String!
    description: String
    catechismLevel: CatechismLevel!
    location: Location!
    catechists: [Person!]!
    catechumens: [Person!]
    createdAt: String
    updatedAt: String
  }

  input CourseInput {
    year: String!
    room: String!
    description: String
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
    createCoursesBulk(input: [CourseInput!]!): [Course]
    deleteCourse(id: ID!): Boolean
    assignCatechistToCourse(courseId: ID!, catechistId: ID!): Course
    removeCatechistFromCourse(courseId: ID!, catechistId: ID!): Course
    createAndAssignCatechumensToCourse(courseId: ID!, catechumens: [CatechumenInput!]!): Course
    removeCatechumensFromCourse(courseId: ID!, catechumens: [ID!]!): Course
    removeCatechumenFromCourse(courseId: ID!, catechumenId: ID!): Course
  }
`;
