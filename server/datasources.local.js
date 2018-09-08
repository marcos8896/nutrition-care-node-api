'use strict';

module.exports = {
  'db': {
    'name': 'db',
    'connector': 'memory',
  },
  'mysql_ds': {
    // eslint-disable-next-line
    'url': process.env.CLEARDB_DATABASE_URL ? 
      process.env.CLEARDB_DATABASE_URL :
      `mysql://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@${ process.env.DB_HOST }:${ process.env.DB_PORT }/${ process.env.DB_NAME }`,
    'name': 'mysql_ds',
    'connector': 'mysql',
  },
};
