require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const JWT = require('@hapi/jwt');

const routes = require('./routes');
const connectDB = require('./database');
const { verifyAdmin, verifyUser } = require('./auth');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([Inert, JWT]);

  server.auth.strategy('user', 'jwt', verifyUser);
  server.auth.strategy('admin', 'jwt', verifyAdmin);

  server.route(routes);
  await connectDB();
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
