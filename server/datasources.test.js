'use strict';

module.exports = {
  'mysql_ds': {
    // eslint-disable-next-line
    'url': `mysql://${ process.env.TEST_DB_USER }:${ process.env.TEST_DB_PASSWORD }@${ process.env.TEST_DB_HOST }:${ process.env.TEST_DB_PORT }/${ process.env.TEST_DB_NAME }`,
    'name': 'mysql_ds',
    'connector': 'mysql',
  },
};
