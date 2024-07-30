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
    getCourse(id: ID!): Course
    getCourses: [Course]
  }

  extend type Mutation {
    assignCatechistToCourse(courseId: ID!, catechistId: ID!): Course
    assignCatechumenToCourse(courseId: ID!, catechumenId: ID!): Course
    createAndAssignCatechumensToCourse(courseId: ID!, catechumens: [CatechumenInput!]!): Course
    createCourse(input: CourseInput!): Course
    createCoursesBulk(input: [CourseInput!]!): [Course]
    deleteCourse(id: ID!): Boolean
    removeCatechistFromCourse(courseId: ID!, catechistId: ID!): Course
    removeCatechistsFromCourse(courseId: ID!, catechistsIds: [ID!]): Course
    removeCatechumenFromCourse(courseId: ID!, catechumenId: ID!): Course
    removeCatechumensFromCourse(courseId: ID!, catechumensIds: [ID!]!): Course
    updateCourse(id: ID!, input: CourseInput!): Course
  }
`;
