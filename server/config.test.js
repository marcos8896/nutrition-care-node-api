'use strict';

module.exports = {
  'restApiRoot': '/api',
  'host': process.env.TEST_API_HOST,
  'port': process.env.TEST_API_PORT,
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
