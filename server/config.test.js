'use strict';

module.exports = {
  'restApiRoot': '/api',
  'host': process.env.TEST_API_HOST,
  // 'port': process.env.TEST_API_PORT,
  // The port is not set here anymore. Instead set on app.listen()
  // inside your tests.
  'remoting': {
    'context': false,
    'rest': {
      'handleErrors': false,
      'normalizeHttpPath': false,
      'xml': false,
    },
    'json': {
      'strict': false,
      'limit': '100kb',
    },
    'urlencoded': {
      'extended': true,
      'limit': '100kb',
    },
    'cors': false,
  },
};
