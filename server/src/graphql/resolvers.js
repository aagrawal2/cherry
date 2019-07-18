// Resolver to match graphQL request and return response
const resolvers = {
    Query: {
        user: async (_, { username, password }, context) => {
            const db = context.sharedResource.db;
            let user = await db.collection('users').findOne({ username });
            if (user) {
                user = await db.collection('users').findOne({ username: username, password: password });
                if (user) {
                    return user;
                }
                else {
                    context.response.status(400);
                    throw new Error('invalid password');
                }
            }
            else {
                context.response.status(400);
                throw new Error('invalid username');
            }
        },
        bofaAccounts: (root, { username }, context, info) => {
            return
        },
        bofaAccount: (root, { username, accountId }, context, info) => {
            return
        }
    },
    Mutation: {
        createUser: async (_, { input }, context) => {
            const { username, password } = input;
            const db = context.sharedResource.db;

            const user = await db.collection('users').findOne({ username });
            if (!user) {
                const result = await db.collection('users').insertOne({ username, password });
                context.response.status(201);
                return result.ops[0];
            }
            else {
                context.response.status(400);
                throw new Error('user already exist');
            }
        }
    }
}

export default resolvers