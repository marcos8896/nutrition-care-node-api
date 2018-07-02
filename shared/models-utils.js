/** 
 * This module is meant to have all the models functionality of the Loopback models.
 * Functionality that needs to be shared in multiple places.
 * @module Shared/ModelsUtils 
 * 
 */


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
 * Return a promises which contains all the Loobpack's custom models from the 
 * JSON files on the common/models folder with the request properties on it.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {string[]} requestedProperties - The wanted properties to be return in
 * promise.
 * @returns {Promise<Object[]>} - A promise which contains an array of objects,
 * and each object represents a Loopback model with the requested properties.
 */
function getModelsWithRequestedProperties( requestedProperties ) {

  const readfiles = require('node-readfiles');
  const arrayModels = [];

  return readfiles('./common/models/', { filter: '*.json' }, (err, filename, model) => {
    if (err) throw err;

    const parsedModel = JSON.parse(model);

    let json = {};

    requestedProperties.forEach( prop => json[prop] = parsedModel[prop] );

    arrayModels.push(json);

  }).then(() => arrayModels)
    .catch( error => console.log(error));
}


/**
 * Return a promises which contains all the Loobpack's seed models from the 
 * JSON files on the dev/seeds/seedModels folder with the request properties on it.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {string[]} requestedProperties - The wanted properties to be return in
 * promise.
 * @returns {Promise<Object[]>} - A promise which contains an array of objects,
 * and each object represents a Loopback model with the requested properties.
 */
function getSeedModelsWithRequestedProperties( requestedProperties ) {

  const readfiles = require('node-readfiles');
  const arraySeedModels = [];

  return readfiles('./dev/seeds/seedModels', { filter: '*.json' }, (err, filename, model) => {
    if (err) throw err;

    const parsedModel = JSON.parse(model);

    let json = {};

    requestedProperties.forEach( prop => json[prop] = parsedModel[prop] );

    arraySeedModels.push(json);

  }).then(() => arraySeedModels)
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
  getNameModelsArray,
  getModelsWithRequestedProperties,
  getSeedModelsWithRequestedProperties
};