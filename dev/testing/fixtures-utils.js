'use strict';

/**
 * Contains simple functionality to create fake data for
 * integration tests.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Fixtures/Fixtures-Utils
 */

const faker = require( 'faker' );

/**
 * Get all the Seed models and processes them to only get the
 * model <code>name</code>, the model <code>filename</code> and the
 * model <code>properties</code> to push it inside the <code>arrayModels</code>
 * array.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
function getModelsSeeds() {

  const readfiles = require( 'node-readfiles' );
  const seedPath = './dev/seeds/seedModels/';

  const arrayModels = [];

  return readfiles(
    `${seedPath}`,
    { filter: '*.json' },
    ( err, filename, contents ) => {

      if ( err ) throw err;

      let json = {
        filename,
        name: JSON.parse( contents ).name,
      // eslint-disable-next-line camelcase
        properties_seeds: JSON.parse( contents ).properties_seeds,
      };

      arrayModels.push( json );

    })
    .then( _ => arrayModels );

}

/**
 * Generates all the fake data that is going to be created on the database,
 * it creates a given number of records of the current seed model based on
 * the given number of records and it puts all these records on an array.
 *
 * @param {*} Model - The current seed model from which the script is going
 * to generate fake data.
 * @param {number} numberOfRecords - The wanted number of records to be created.
 * @returns {Object[]} Returns an array with fake records of the current seed model.
 */
function getFakeModelsArray( Model, numberOfRecords ) {

  let fakeModel = { };
  const fakeModelsArray = [];
  for ( let i = 0; i < numberOfRecords; i++ ) {

    Model.properties_seeds.forEach( prop =>
      fakeModel[Object.keys( prop )[0]] = faker.fake( Object.values( prop )[0] )
    );
    fakeModelsArray.push( fakeModel );
    fakeModel = { };

  }

  return fakeModelsArray;

}


/**
 * Return a wanted model from an array of seed models. If it is not found, returns
 * <code>null</code>.
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels files.
 * @param {string} modelName - The name of the model to find.
 */
function findSeedModel( seedModels, modelName ) {

  return seedModels.find( model => model.name == modelName );

}

module.exports = {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
};

