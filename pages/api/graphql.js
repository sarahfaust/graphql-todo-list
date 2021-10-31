import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';

require('dotenv').config();
const postgres = require('postgres');
const sql = postgres();

const typeDefs = gql`
  type Query {
    users: [User!]!
    user(username: String): User
    todo(id: ID!): Todo
    todos(filterChecked: Boolean): [Todo]
  }
  type Mutation {
    createTodo(title: String!): Todo
  }
  type User {
    name: String
    username: String
  }
  type Todo {
    id: ID
    title: String
    checked: Boolean
  }
`;

const todos = [
  { id: '1', title: 'Buy bananas', checked: false },
  { id: '2', title: 'Buy milk', checked: true },
  { id: '3', title: 'Buy chocolate', checked: false },
];

const users = [
  { name: 'Leeroy Jenkins', username: 'leeroy' },
  { name: 'Foo Bar', username: 'foobar' },
];

const getTodos = async () => {
  return await sql`
  SELECT * FROM todos;`;
};

const getTodo = async (id) => {
  const result = await sql`
  SELECT * FROM todos WHERE id = ${id};`;
  return result[0];
};

const getFilteredTodos = async (checked) => {
  return await sql`
  SELECT * FROM todos WHERE checked = ${checked};`;
};

const createTodo = async (title) => {
  const result = await sql`
  INSERT INTO todos (title, checked) VALUES (${title}, ${false}) RETURNING id, title, checked;`;
  return result[0];
};

const resolvers = {
  Query: {
    todos: (parent, args) => {
      if (args.filterChecked === true) {
        return getFilteredTodos(true);
      } else if (args.filterChecked === false) {
        return getFilteredTodos(false);
      }
      return getTodos();
    },
    todo: (parent, args) => {
      return getTodo(args.id);
    },
    users: () => {
      return users;
    },
    user: (parent, { username }) => {
      return users.find((user) => user.username === username);
    },
  },
  Mutation: {
    createTodo: (parent, args) => {
      return createTodo(args.title);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
