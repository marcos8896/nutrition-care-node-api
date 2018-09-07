'use strict';

const portfinder = require( 'portfinder' );

/**
 * Contain shared functions to set the testing environment
 * properly.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Testing/Enviroment-utils
 */

/**
 * Find an available port.
 *
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Number>} Returns a promise which contains
 * an available port number.
 */
const getFreePort = () => portfinder.getPortPromise();

/**
 * Compose the baseURL for the testing environment by adding
 * the `TEST_API_HOST` to a given port.
 *
 * @param {String} port - The wanted port in which the TEST API will
 * be listening to requests
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {String} Return a the full BaseURL.
 */
const getBaseURLWithPort = ( port ) =>  `http://${process.env.TEST_API_HOST}:${port}/api`;


if ( process.env.NODE_ENV === 'test' ) {

  module.exports = {
    getFreePort,
    getBaseURLWithPort,
  };

}
