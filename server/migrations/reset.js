'use strict';

/**
 * This module contain the <code>runModelsMigrations</code> script, which
 * reconstructs all the database <b>deleting all the current data on it</b>
 * Use it only on development mode or with dummy data.
 * @module Migrations/Reset
 *
 */

var server = require( '../server' );
var ds = server.dataSources.mysql_ds;
const { getNameModelsArray } = require( '../../shared/models-utils' );

/**
 * Run the proper migrations by loading automatically all the new custom models.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {undefined}
 */
function runModelsMigrations() {

  getNameModelsArray().then( names => {

    // There's no need to add new custom models in the 'lbTables', since they are
    // being loaded automatically from the models' JSON files.
    var lbTables = [
      'User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', ...names,
    ];

    ds.automigrate( lbTables, function( er ) {

      if ( er ) throw er;

      console.log(
        'Loopback tables [' + lbTables + '] created in ',
        ds.adapter.name
      );
      ds.disconnect();

    });

  });

}

runModelsMigrations();
