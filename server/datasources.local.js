'use strict';

module.exports = {
  'db': {
    'name': 'db',
    'connector': 'memory',
  },
  'mysql_ds': {
    'url': process.env.JAWSDB_URL ?
           process.env.JAWSDB_URL :
           // eslint-disable-next-line
           `mysql://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@${ process.env.DB_HOST }:${ process.env.DB_PORT }/${ process.env.DB_NAME }`,
    'name': 'mysql_ds',
    'connector': 'mysql',
  },
  'storage': {
    'name': 'storage',
    'connector': 'loopback-component-storage',
    'provider': 'filesystem',
    'root': './storage',
    'allowedContentTypes': ['image/jpg', 'image/jpeg', 'image/png', 'image/tiff'],
    'maxFileSize': 1 * 1024 * 1024,
    'getFilename': function( fileInfo ) {

      var { extension } = require( 'mime-types' );
      return 'image-' + new Date().getTime() + '.' + extension( fileInfo.type );

    },
  },
};
