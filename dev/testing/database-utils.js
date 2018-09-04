'use strict';

/**
 * Run the proper migrations, thereby, performs a complete reset of the
 * given database. Only for testing.
 * @param {dataSource} db - A given data source in which the migration
 * will run. Usually it is a property that can be get from
 * <code>app.dataSources</code> where 'app' is the Loopback instance.
 * @param {String[]} modelNames - An array that contains all the models
 * to be reset in the database/datasource
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<undefined>}
 */
const resetTables = ( db, modelNames ) => {

  if ( process.env.NODE_ENV === 'test' ) {

    const lbTables = [
      'User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', ...modelNames,
    ];

    return new Promise( ( resolve, reject ) => {

      db.automigrate( lbTables, ( er ) => {

        if ( er )
          reject( er );
        else
          resolve();

      });

    });

  } else
    throw new Error( 'You are not in a testing environment' );

};

module.exports = {
  resetTables,
};
