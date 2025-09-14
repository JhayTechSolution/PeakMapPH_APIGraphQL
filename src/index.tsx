import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../', `.env.${process.env.NODE_ENV || 'development'}`) });

import Fastify from 'fastify';
import middie from '@fastify/middie';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import mercurius from 'mercurius';
import { PubSub } from 'graphql-subscriptions';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { loadSchema } from './schema';
import { Database } from './db/dbInstance';
import { resolvers, pubsub } from './resolvers';

async function buildServer() {
  const fastify = Fastify({ logger: true });
  await fastify.register(middie);

  if (process.env.NODE_ENV !== 'production') {
    // createPouchServer(fastify); // optional
  }

  return fastify;
}

const start = async () => {
  const db = new Database(process.env.DBNAME);
  const app = await buildServer();

  const typeDefs = await loadSchema(); // must return SDL string
  const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

  // Register Mercurius without subscriptions
  await app.register(mercurius, {
    schema: typeDefs,
    resolvers,
    subscription: false, 
    graphiql: true,
    context: () => ({ pubsub }),
  });

  await app.ready();

  // WebSocket server
  const wsServer = new WebSocketServer({
    server: app.server,
    path: '/graphql',
  });

  useServer(
    {
      schema: executableSchema,           // MUST be executable schema
      execute: undefined,                 // graphql-ws will handle
      subscribe: undefined,               // graphql-ws will handle
      context: () => ({ pubsub }),        // make pubsub available
    },
    wsServer
  );

  const PORT = process.env.PORT || 3001;
  await app.listen({ port: PORT, host: '0.0.0.0' });

  console.log(`HTTP ready � http://localhost:${PORT}/graphiql`);
  console.log(`WS ready � ws://localhost:${PORT}/graphql`);
};

start().catch(console.error);
