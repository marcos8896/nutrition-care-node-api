'use strict';

/**
 * Contain shared functions to set the testing environment
 * properly.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Testing/Enviroment-utils
 */

/**
 * Compose the baseURL for the testing environment by adding
 * the `TEST_API_HOST` to a given port.
 *
 * @param {String} port - The wanted port in which the TEST API will
 * be listening to requests
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {String} Return a the full BaseURL.
 */
const getBaseURLWithPort = ( port ) =>
  `http://${process.env.TEST_API_HOST}:${port}/api`;


/**
 * Compose the a PORT based on the given TEST_API_PORT port from the
 * env file and the current JEST_WORKER_ID.
 * @example
 * process.env.TEST_API_PORT=8880
 * process.env.JEST_WORKER_ID=1
 *
 * then
 *
 * getApiTestPort returns 8881
 *
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Number} A generated port to run the testing API.
 */
const getApiTestPort = () => parseInt( process.env.TEST_API_PORT ) +
                             parseInt( process.env.JEST_WORKER_ID );


/**
 * Create a new test database to parallelize the integration tests.
 * It uses the JEST_WORKER_ID to create a unique database per worker.
 *
 * @returns {Promise<Object>} Return a promise which contains the
 * results from the mysql query or the error in case of failure.
 * @async
 */
const createTestingDatabase = async () => {

  const mysql = require( 'mysql' );
  const pool  = mysql.createPool({
    host: process.env.TEST_API_HOST,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
  });

  await new Promise( ( resolve, reject ) => {

    pool.query( `
          CREATE DATABASE IF NOT EXISTS 
          ${process.env.TEST_DB_NAME}_${process.env.JEST_WORKER_ID}`,
          function( error, results ) {

            if ( error ) return reject( error );

            return resolve( results );

          });

  }).catch( err => err );

  return new Promise( ( resolve, reject ) => {

    pool.end( err => {

      if ( err ) return reject( err );
      else return resolve();

    });

  }).catch( err => err );

};


/**
 * Creates all the environment for the integration test.
 *
 * @returns {Promise<Object>} Return a promise which contains an
 * object an apiPort in which the testing API port can be mounted,
 * a baseURL where the axios api calls with have to point to,
 * and the seedModels which contains all the seedModel to generate
 * fake data.
 */
const integrationTestSetup = async ({ datasource, dbModelsToReset }) => {

  const { getModelsSeeds } = require( './fixtures-utils' );
  const { resetTables } = require( './database-utils' );

  const [allModelSeeds] = await Promise.all( [
    getModelsSeeds(),
    createTestingDatabase(),
  ] ).catch( err => {

    throw err;

  });

  const apiPort = getApiTestPort();
  const baseURL = getBaseURLWithPort( apiPort );
  const seedModels = allModelSeeds;

  await resetTables( datasource, dbModelsToReset );

  return {
    retunedApiPort: apiPort,
    retunedBaseURL: baseURL,
    retunedSeedModels: seedModels,
  };

};

if ( process.env.NODE_ENV === 'test' ) {

  module.exports = {
    getBaseURLWithPort,
    createTestingDatabase,
    getApiTestPort,
    integrationTestSetup,
  };

}
