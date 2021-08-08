"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const redis_1 = __importDefault(require("redis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const cors_1 = __importDefault(require("cors"));
const graphql_upload_1 = require("graphql-upload");
const http_1 = require("http");
const resolvers_1 = require("./resolvers");
const prisma = new client_1.PrismaClient({
    log: ["query", "info", `warn`, `error`],
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = express_1.default();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redisClient = redis_1.default.createClient();
    app.set("trust proxy", 1);
    const options = {
        host: "127.0.0.1",
        port: 6379,
        retryStrategy: (times) => Math.max(times * 100, 3000),
    };
    const pubSub = new graphql_redis_subscriptions_1.RedisPubSub({
        publisher: new ioredis_1.default(options),
        subscriber: new ioredis_1.default(options),
    });
    app.use(cors_1.default({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redisClient,
            disableTouch: true,
            url: process.env.REDIS_URL,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
            domain: constants_1.__prod__ ? ".appero.online" : undefined,
        },
        secret: process.env.SESSION_COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
    }));
    app.use(graphql_upload_1.graphqlUploadExpress({
        maxFieldSize: 10000000000000,
        maxFileSize: 10000000000000,
        maxFiles: 10,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                resolvers_1.VenueResolver,
                resolvers_1.SectionResolver,
                resolvers_1.ItemResolver,
                resolvers_1.ImageResolver,
                resolvers_1.MenuResolver,
            ],
            validate: false,
            pubSub,
        }),
        subscriptions: {
            path: "/subscriptions",
        },
        uploads: false,
        context: ({ req, res }) => ({ prisma, req, res }),
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    const httpServer = http_1.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(parseInt(process.env.PORT), () => {
        console.log(`listening on port ${process.env.PORT}`);
    });
});
main();
//# sourceMappingURL=index.js.map