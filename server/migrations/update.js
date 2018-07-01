/** 
 * Simple module that takes care of <b>update</b> the database based on the
 * new changes that the Loopback's models can have. It will try to keep the
 * data intact as much as possible, even though, it has to be used with caution.
 * @module Migrations/Update 
 * 
 */

var server = require('../server');
var ds = server.dataSources.mysql_ds;
const { getNameModelsArray } = require('../../shared/models-utils');


/**
 * Run the proper autoupdate processes by loading automatically all existing custom models.
 * 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {undefined} 
 */
function runModelsAutopdate() {
  getNameModelsArray().then( names => {

    //There's no need to add new custom models in the 'lbTables', since they are
    //being loaded automatically from the models' JSON files.
    var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', ...names];
  
    ds.autoupdate(lbTables, function(er) {
      if (er) throw er;
      console.log('Loopback tables [' + lbTables + '] updated in ', ds.adapter.name);
      ds.disconnect();
    });
  })
}

runModelsAutopdate();
