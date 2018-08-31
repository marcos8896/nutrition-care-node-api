
'use strict';


/**
 * Dedicated services to handle all the diet related methods.
 *
 * @module DietService
 */



/**
 * Receives a new diet model as first param and its diet details as a second param,
 * creates them on the database and makes the relations between them in one
 * database transaction.
 * @param {Object} diet The given diet to be registered.
 * @param {Object[]} dietDetails An array with all the dietDetails objects that have to be
 * related with the main diet object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback
 * @async
 * @returns
 */
const remoteMethodFullDietRegistration = async ( diet, dietDetails, cb ) => {

  return { exampleId: 0 };
    // return cb( null);

};

const fullDietRegistrationOptions = {
  accepts: [
    {
      arg: 'diet',
      type: 'Object',
      required: true,
      description: 'A given diet object to be registered.',
    },
    {
      arg: 'dietDetails',
      type: 'array',
      required: true,
      description: [
        'An array with all the dietDetails objects that have to ',
        'be related with the main diet object.',
      ],
    },
  ],
  returns: { arg: 'dietId', type: 'Number', root: true },
  http: {
    path: '/fullDietRegistration',
    verb: 'post',
  },
};

module.exports = {

  fullDietRegistration: {
    remoteMethod: remoteMethodFullDietRegistration,
    remoteMethodOptions: fullDietRegistrationOptions,
  },

  //Next method

};
