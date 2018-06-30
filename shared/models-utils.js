/**
 * Return a promises which contains all the Loobpack's custom models with 
 * all its properties on it.
 * 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Array>} 
 */
function getModelsContentFromJSONs() {
  const readfiles = require('node-readfiles');
  let arrayModels = [];

  return readfiles('./common/models/', { filter: '*.json' }, (err, filename, contents) => {
    if (err) throw err;

    let json = {
      filename,
      name: JSON.parse(contents).name,
      properties_seeds: Object.keys(JSON.parse(contents).properties)
    }

    arrayModels.push(json);

  }).then(() => arrayModels)
    .catch( error => console.log(error));
}
  

/**
 * Return a promise which contains only the names from all the Loobpack's custom models.
 * 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Array>} 
 */
async function getNameModelsArray() {

  let names = [];
  
  try {
    names = await getModelsContentFromJSONs().then( models => models.map( model => model.name));
  } catch (error) {
    console.log(error);
  }
  
  return names;
}


module.exports = {
  getModelsContentFromJSONs,
  getNameModelsArray
};