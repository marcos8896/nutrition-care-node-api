'use strict';
/**
 * Contains all the shared functionality between the 'simpleSeed' and the 'complexSeeds'.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Seeds/Utils/Shared
 */

const faker = require( 'faker' );

/**
 * Validates if the current seed model has all its properties_seeds filled.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {Object} Model - A given seed model object.
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 */
function areAllpropertiesSeedsFilled( Model ) {

  const propertiesValues = Model.properties_seeds
    .map( property => Object.values( property )[0] );

  return propertiesValues.every( property => property );

}



/**
 * Determines what kind of seed is going to need the current model.
 * There are two kind of seeds:
 * - The simple, which only runs a function that create fake data
 *   by using the seed JSON file for the given seed model.
 * - The complex, which also create fake models for the given seed
 *   model, however, this one also takes in consideration every
 *   related models by using the relations of the current model.
 * @param {string[]} relationsTypes - An array with all the relations from the
 * current model.
 * @returns {string} Returns the kind of seed that is going to be needed for the
 * given seed model.
 */
function typeOfSeedToGenerate( relationsTypes ) {

  // Only 'hasMany' relations.
  if ( relationsTypes.length === 0 )
    return 'simpleSeed';

  else if ( relationsTypes.includes( 'belongsTo' ) ||
            relationsTypes.includes( 'hasMany' ) )
    return 'complexSeed';

  else throw 'One or more relations that your model ' +
             'has are not supported currently.';

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
 * Takes an array and returns a random element from it.
 *
 * @param {*} array - An array from which is going to be returned
 * a random element.
 * @returns {any} - A random element from the array param.
 */
function getRandomElementFromArray( array ) {

  return array[Math.floor( Math.random() * array.length )];

}



/**
 * Returns all the relations's types from a given model.
 *
 * @async
 * @param {string} modelName - The name of the model from which the developer wants to get
 * its relations' types.
 * @param {callback} cb
 * @returns {Promise<string[]>} modelRelationsType - A promise which contains an array with
 * the relations' types.
 */
async function getRelationsTypeFromLoopbackModel( modelName, cb ) {

  const {
    getModelsWithRequestedProperties,
   } = require( '../../../shared/models-utils.js' );

  try {

    const models = await getModelsWithRequestedProperties(
      ['name', 'relations']
    );

    const model = models.find( model => model.name === modelName );

    const modelRelationsType = Object.keys( model.relations )
      .map( key => model.relations[key].type );

    return modelRelationsType;

  }  catch ( error ) {

    return cb( error );

  }

}

module.exports = {
  areAllpropertiesSeedsFilled,
  typeOfSeedToGenerate,
  getFakeModelsArray,
  getRandomElementFromArray,
  getRelationsTypeFromLoopbackModel,
};
