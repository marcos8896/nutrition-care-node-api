'use strict';

/**
 * Prepares all the JSON seed files in order to generate fake
 * data for the Loopback's model that are allocated on the common folder.
 * The output that generate is a JSON file per Loopback model file that
 * allows the user to enter faker.js' mustache syntax to generate all
 * kind of fake data to test his or her applications.
 * @module Seeds/Prepare
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */

const asyncSeries = require( 'async' ).series;
const fileExists = require( 'file-exists' );
const mkdirp = require( 'mkdirp' );
const readfiles = require( 'node-readfiles' );

const { logMessage } = require( './utils/terminal/console' );


/**
 * The absolute path in which the JSON models seeds with be written.
 * @type {string}
 */
const seedsDirectory = '/dev/seeds/seedModels/';


/**
 * The main array which several methods across the module will have access to.
 * @type {Object[]}
 */
let arrayModels = [];


/**
 * This function is the one that starts all the process in this file, by running
 * all the other functions in the proper order one by one, one after the other.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
function bootstrapFuction() {

  asyncSeries( [
    cb => getModelsContentFromJSONs( cb ),
    cb => prepareSeedsModels( cb ),
    cb => checkIfDirectoryExists( cb ),
    cb => checkJSONSeedsAvailability( cb ),
    cb => keepPropetiesFromJSONSeedModelsUpToDate( cb ),
    cb => writeRemainingJSONFiles( cb ),
  ], ( err, results ) => {

    if ( err ) {

      logMessage({ color: 'redBright', bold: true, message: err, error: true });
      logMessage({
        color: 'cyanBright',
        bold: true,
        message: '\n-----There previous error forced ' +
                 'the Seed Process to be stopped.-----\n',
      });

    } else {

      logMessage({
        color: 'greenBright', bold: true,
        message: '\nTodo bien, men. All the seed files were ' +
                 'created and updated successfully :)\n',
      });

      process.exit( 0 );

    }


  });

}


/**
 * Get all the Custom Loopback's models and processes them to only get the
 * model <code>name</code>, the model <code>filename</code> and the
 * model <code>properties</code> to push it inside the <code>arrayModels</code>
 * array.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 * @example
 * //The arrayModels shape at this point.
 * arrayModels:  [
 *   {
 *     "filename": "model1.json",
 *     "name": "Model1",
 *     "properties_seeds": [
 *       "id",
 *       "name",
 *       "last_name",
 *     ]
 *   },
 *   //... more models
 * ]
 */
function getModelsContentFromJSONs( cb ) {

  readfiles( './common/models/',
    { filter: '*.json' },
    ( err, filename, contents ) => {

      if ( err ) throw err;

      const parsedObject = JSON.parse( contents );

      let json = {
        filename,
        name: parsedObject.name,
         // eslint-disable-next-line camelcase
        properties_seeds: Object.keys( parsedObject.properties ),
        base: parsedObject.base,
      };

      arrayModels.push( json );

    })
  .then( files => cb( null ) )
  .catch( err => {

    console.log( 'Error reading files:', err.message );
    cb( err );

  });

}


/**
 * Get all the previous processed models from the <code>arrayModels</code> array
 * and generate the <code>properties_seeds</code> property on each
 * one of them with the wanted shape in order to allow the seeder to introduces
 * mustache syntax strings in each on of the properties from every model.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <b>prepare process</b> on the file.
 * @example
 * {
 *  "filename": "routine.json",
 *  "name": "Routine",
 *  "properties_seeds": [
 *    {
 *      "description": ""
 *    }
 *  ]
 * }
 */
function prepareSeedsModels( cb ) {

  arrayModels.forEach( model =>
    // eslint-disable-next-line camelcase
    model.properties_seeds = model.properties_seeds.map( prop =>
      prop = { [prop]: '' }
    )
  );
  cb( null );

}


/**
 * Simple function that checks whether the current directory from the
 * <code>seedsDirectory</code> cons actually exists. If not, it creates it.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <b>prepare process</b> on the file.
 *
 */
function checkIfDirectoryExists( cb ) {

  mkdirp( `.${seedsDirectory}`, ( err ) => {

    if ( err ) cb( err );
    cb( null );

  });

}


/**
 * Checks on by one if each model from the <code>arrayModels</code> array
 * currently exists as a JSON seed file. If some mode already exists, then
 * the <code>hasToBeModifiedOrAdded</code> property is added depending of
 * the result.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @prop {boolean} model.hasToBeModifiedOrAdded
 * @param {callback} cb - The next callback to keep the flow on all the
 * <b>prepare process</b> on the file.
 *
 */
function checkJSONSeedsAvailability( cb ) {

  let promises = [];
  arrayModels.forEach( model => {

    promises.push(
      fileExists( `.${seedsDirectory}seed-${model.filename}` ).then( exists => {

        model.hasToBeModifiedOrAdded = !exists;
        // console.log(exists); // OUTPUTS: true or false

      })
    );

  });

  Promise.all( promises ).then( () => cb( null ) );

}


/**
 * Checks if the current JSON Seed models are up to date. Deletes all the properties
 * from the JSON seed files that are not showed on the main Loopback models and also
 * add to the JSON seed files all the new properties that exists on the main Loopback
 * models.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <b>prepare process</b> on the file.
 *
 */
function keepPropetiesFromJSONSeedModelsUpToDate( cb ) {

  readfiles(
    `.${seedsDirectory}`,
    { filter: '*.json' },
    ( err, filename, jsonString ) => {

      // Parsed to an object the previous JSON seed file.
      const seedObject = JSON.parse( jsonString );

      // Get current object seed from array to check if they have the same properties.
      const objectFromArrayModelsIndex = arrayModels.findIndex( model => {

        return seedObject.name === model.name;

      });

      const objectFromArrayModels = arrayModels[objectFromArrayModelsIndex];

      // Get every property of the previous seed object on a new array.
      const currentSeedProperties = seedObject.properties_seeds.map( prop => {

        return Object.keys( prop )[0];

      });

      // Get every property of the current seed object on a new array.
      const currentModelProperties = objectFromArrayModels
      .properties_seeds.map( prop => { // eslint-disable-line camelcase

        return Object.keys( prop )[0];

      });


      ( function addNewPropertiesToTheSeedJSONModels() {

      // Get an array of all the properties that have to be added to the seed model.
        const newPropertiesToWrite = currentModelProperties.filter( val => {

          return !currentSeedProperties.includes( val );

        });


        if ( newPropertiesToWrite.length > 0 ) {

          // Get current model from main array.
          let current = arrayModels[objectFromArrayModelsIndex];

          // Create an object to be added to the curretn properties_seeds on the seed model.
          let newPropertiesObject = newPropertiesToWrite.map( prop => {

            return { [prop]: '' };

          });

          // Added all new properties to the current JSON model that will be re-write.
          // eslint-disable-next-line camelcase
          current.properties_seeds = [
            ...newPropertiesObject, ...seedObject.properties_seeds,
          ];
          current.hasToBeModifiedOrAdded = true;

        }

      })();


      ( function deleteLeftoverPropertiesFromSeedJSONModels() {

        const BASE_MODEL_PROTECTED_PROPERTIES = {
          'User': ['email', 'password'],
        };

        // Get an array of all the properties that have to be deleted from the seed model.
        const leftoverPropertiesToDelete = currentSeedProperties
        .filter( val => {

          const baseModelKeys = Object.keys(
            BASE_MODEL_PROTECTED_PROPERTIES
          );

          const baseModelIsIncluded = baseModelKeys
            .includes( seedObject.base );

          let isProtectedProperty = false;
          let i = 0;

          while ( baseModelIsIncluded && i < baseModelKeys.length ) {

            if ( val === baseModelKeys[i] ) {

              isProtectedProperty = true;
              break;

            }

            i = i + 1;

          }

          return !currentModelProperties.includes( val ) &&
                 isProtectedProperty &&
                 baseModelIsIncluded;

        });


        if ( leftoverPropertiesToDelete.length > 0 ) {

          // Get current model from main array.
          let current = arrayModels[objectFromArrayModelsIndex];

          leftoverPropertiesToDelete.forEach( prop => {

            let indexToDelete;

            seedObject.properties_seeds.forEach( ( currentPropObject, i ) => {

              if ( Object.keys( currentPropObject )[0] === prop )
                indexToDelete = i;

            });

            // Delete the property fro the property seed array of the current seed model.
            seedObject.properties_seeds.splice( indexToDelete, 1 );

            indexToDelete = null;

          });

          // eslint-disable-next-line camelcase
          current.properties_seeds = [...seedObject.properties_seeds];
          current.hasToBeModifiedOrAdded = true;

        }

      })();


    })
  .then( files => cb( null ) )
  .catch( err => {

    console.log( 'Error reading files:', err.message );
    cb( err );

  });

}


/**
 * Writes all the new seed models or modified the ones that have new properties or
 * the ones that have unnecesary properties (for example, properties that not longer
 * exists on the main Loopback model of a given seed model).
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <b>prepare process</b> on the file.
 *
 */
function writeRemainingJSONFiles( cb ) {

  let each = require( 'async' ).each;
  const remainingJSONs = arrayModels
    .filter( model => model.hasToBeModifiedOrAdded );

  // Removed hasToBeModifiedOrAdded property to not write it on the JSON Seed files.
  remainingJSONs.forEach( json => delete json.hasToBeModifiedOrAdded );

  const jsonfile = require( 'jsonfile' );

  each( remainingJSONs, ( json, eachCallback ) => {

    let file = `.${seedsDirectory}seed-${json.filename}`;
    let obj = json;

    jsonfile.writeFile( file, obj, { spaces: 2 }, function( err ) {

      if ( err ) eachCallback( err );
      eachCallback();

    });

  }, err => {

    if ( err ) cb( err );
    else cb( null );

  });

}

module.exports = bootstrapFuction;
