import "reflect-metadata";
import "dotenv-safe/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import cors from "cors";
import { graphqlUploadExpress } from "graphql-upload";
import { createServer } from "http";
import { MyContext } from "./types";
import {
  VenueResolver,
  MenuResolver,
  SectionResolver,
  ItemResolver,
  ImageResolver,
} from "./resolvers";

const prisma = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
});

const main = async () => {
  const app = express();
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.set("trust proxy", 1);

  // configure Redis connection options
  const options: Redis.RedisOptions = {
    host: "127.0.0.1",
    port: 6379,
    retryStrategy: (times) => Math.max(times * 100, 3000),
  };

  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        url: process.env.REDIS_URL,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
        domain: __prod__ ? ".appero.online" : undefined,
      },
      secret: process.env.SESSION_COOKIE_SECRET as string,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(
    graphqlUploadExpress({
      maxFieldSize: 10000000000000,
      maxFileSize: 10000000000000,
      maxFiles: 10,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        VenueResolver,
        SectionResolver,
        ItemResolver,
        ImageResolver,
        MenuResolver,
      ],
      validate: false,
      pubSub,
      // authChecker: customAuthChecker,
    }),
    subscriptions: {
      path: "/subscriptions",
      // other options and hooks, like `onConnect`
    },
    uploads: false,
    context: ({ req, res }): MyContext => ({ prisma, req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);
  httpServer.listen(parseInt(process.env.PORT), () => {
    console.log(`listening on port ${process.env.PORT}`);
  });
};

main();
