// Cherry graphQL schema as input to graphQL server
const typeDefs = [`
    # Queries 

    type Query {
        user(username: String, password: String): User,        
        bofaAccounts(username: String): [BofaAccount],
        bofaAccount(_id: String): BofaAccount    
    }

    type User {               
        _id: ID
    }    
        
    type BofaAccount {
        _id: String,
        type: String,
        accNum: String,
        nickname: String
    }

    # Mutations     

    input UserEntry {
        username: String,
        password: String
    }

    type Mutation {
        createUser(input: UserEntry): User
        delUser(_id: ID): User
    }
`]

export default typeDefs

/*
Query using GET:
    http://localhost/cherry/graphql?query={user(username:"test",password:"test"){_id}}
Query using POST:
    http://localhost/cherry/graphql   requBody: {"query":"{ user(username: \"test\",password: \"test\") {_id} }"}
Mutation using POST only:
    http://localhost/cherry/graphql   requBody: {"query":"mutation{ createUser(input: { username: \"xyz1\", password: \"xyz1\"  }){    _id  }}"}
*/