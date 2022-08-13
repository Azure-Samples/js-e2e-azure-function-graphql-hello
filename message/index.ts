import { ApolloServer, gql} from "apollo-server-azure-functions";
import { v4 as uuidv4 } from 'uuid';

const database = { [uuidv4()] :{"author": "dina", "content": "good morning"} };

const typeDefs = gql`
    input MessageInput {
        content: String
        author: String
    }

    type Message {
        id: ID!
        content: String
        author: String
    }

    type Query {
        getMessage(id: ID!): Message,
        getMessages:[Message]
    }

    type Mutation {
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
`;

class Message {

    id: any;
    content: string;
    author: string;

    constructor(id: String, {content, author}) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}

const resolvers = {
    Mutation: {
        createMessage: (_, {input}) => {
            const id = uuidv4();

            database[id] = input;
            return new Message(id, input);
        },
        updateMessage: (_, {id, input}) => {
            if (!database[id]) {
                throw new Error('no message exists with id ' + id);
            }
            database[id] = input;
            return new Message(id, input);
        },
    },
    Query: {
        getMessage: (_, {id}) => {
            if (!database[id]) {
                throw new Error('no message exists with id ' + id);
            }
            return new Message(id, database[id]);
        },
        getMessages: (_, ) => {
            let arr = [];
            for (var key in database) {
                if (database.hasOwnProperty(key)) {
                    arr.push({
                        id: key,
                        author: database[key].author,
                        content: database[key].content
                    });
                }
            }
            return arr;
        },
    }
};
// @ts-ignore
const server = new ApolloServer({ typeDefs, resolvers, debug: true,playground: true});

export default server.createHandler({
  cors: {
    origin: '*'
  },
});

/*
Example playground queries:

// get all messages
{getMessages{id, author, content}}

// add a message
mutation{
  createMessage(input:{
    author: "John Doe",
    content: "Oh happy day"
  }){id}
}

// add a message response
{
  "data": {
    "createMessage": {
      "id": "79e4c338-162d-4c1e-a6f0-320bd78a7817"
    }
  }
}

// update a message
mutation{
  updateMessage (
    id: "79e4c338-162d-4c1e-a6f0-320bd78a7817",
    input:{
      author: "John Doe",
      content: "Oh happy day"
    }
  ){id, content, author}
}

// update a message response
{
  "data": {
    "updateMessage": {
      "id": "79e4c338-162d-4c1e-a6f0-320bd78a7817",
      "content": "Oh happy day",
      "author": "John Doe"
    }
  }
}

// get specific message
{
    getMessage(id: "79e4c338-162d-4c1e-a6f0-320bd78a7817"){
        id, content, author
    }
}


// get specific message - response
{
  "data": {
    "getMessage": {
      "id": "79e4c338-162d-4c1e-a6f0-320bd78a7817",
      "content": "Oh happy day",
      "author": "John Doe"
    }
  }
}

*/