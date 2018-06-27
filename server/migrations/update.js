var server = require('../server');
var ds = server.dataSources.mysql_ds;
const { getNameModelsArray } = require('./utils/models-information');


/**
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * Run the proper autoupdate processes by loading automatically all existing custom models.
 * @returns {*} 
 */
function runModelsAutopdate() {
  getNameModelsArray().then( names => {

    //There's no need to add new custom models in the 'lbTables', since they are
    //being loaded automatically from the models' JSON files.
    var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', ...names];
  
    ds.autoupdate(lbTables, function(er) {
      if (er) throw er;
      console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
      ds.disconnect();
    });
  })
}

runModelsAutopdate();
