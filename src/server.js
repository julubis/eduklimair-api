const Hapi = require('@hapi/hapi');
const connectDB = require('./database');
const routes = require('./routes');
require('dotenv').config();

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

  server.route(routes);
  await connectDB();
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
