
'use strict';


/**
 * Dedicated services to handle all the diet related methods.
 *
 * @module DietService
 */

const app = require( '../../server/server' );

/**
 * Receives a new diet model as first param and its diet details as a second param,
 * creates them on the database and makes the relations between them in one
 * database transaction.
 * @param {Object} diet The given diet to be registered.
 * @param {Object[]} dietDetails An array with all the dietDetails objects that have to be
 * related with the main diet object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Object} An object with the already created dietId
 */
const fullDietRegistration = async ( diet, dietDetails ) => {

  const { Diet, Diet_Food_Detail } = app.models; //eslint-disable-line

  let transaction;

  try {

    // Creates low level Loopback transaction.
    transaction = await Diet.beginTransaction({
      isolationLevel: Diet.Transaction.REPEATABLE_READ,
    });

    // Sets transaction options.
    const options = { transaction };

    // Gets the registeredDiet id.
    const registeredDiet = await Diet.create( diet, options );
    const { id } = registeredDiet;

    // Sets the registeredDiet id to every single dietDetails.
    const dietDetailsWithId = dietDetails.map( item => {

      return { ...item, dietId: id  };

    });

    // Creates all the Diet_Food_Detail records.
    await Diet_Food_Detail.create( dietDetailsWithId, options ); //eslint-disable-line

    // Attempts to commit all the changes.
    await transaction.commit();

    // Returns the dietId to the client.
    return { dietId: id };


  } catch ( error ) {

    try {

      // Attempts to rollback all the changes (it could cause an error itself
      // which is why it is required another try/catch).
      await transaction.rollback();
      return error;

    } catch ( seriousError ) {

      return seriousError;

    }

  }

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
  description: [
    'Receive a new diet model as first param and its diet details ',
    'as a second param and creates them on the database',
  ],
};


//--------------------------------------------------------------------------------

/**
 * Receives an existing diet model as first param and its modified diet details as
 * a second param, edit them on the database and makes the relations between them in one
 * database transaction.
 * @param {Object} diet The given diet to be edited.
 * @param {Object[]} dietDetails An array with all the edited dietDetails objects
 * that have to be related with the given diet object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Object} An object with the already edited dietId
 */
const editDiet = async ( diet, dietDetails ) => {

  const { Diet, Diet_Food_Detail } = app.models; //eslint-disable-line

  let transaction;

  try {

    // Creates low level Loopback transaction.
    transaction = await Diet.beginTransaction({
      isolationLevel: Diet.Transaction.REPEATABLE_READ,
    });

    // Sets the editedDiet id to every single dietDetails.
    const dietDetailsWithId = dietDetails.map( item => {

      return {
        calories: item.calories,
        carbohydrates: item.carbohydrates,
        fats: item.fats,
        proteins: item.proteins,
        desiredGrams: item.desiredGrams,
        description: item.description,
        foodId: item.foodId,
        dietId: diet.id,
        id: undefined,
      };

    });

    // Sets transaction options.
    const options = { transaction };

    const editedDiet = await Diet.upsert( diet, options );

    // Delete all the diet details that are related to the main diet record.
    await editedDiet.dietFoodDetails.destroyAll({}, options );

    // Re-creates all the Diet_Food_Detail edited records.
    await Diet_Food_Detail.create( dietDetailsWithId, options );

    // Attempts to commit all the changes.
    await transaction.commit();

    // Returns the dietId to the client.
    return { dietId: editedDiet.id };

  } catch ( error ) {

    try {

      // Attempts to rollback all the changes (it could cause an error itself
      // which is why it is required another try/catch).
      await transaction.rollback();
      throw error;

    } catch ( err ) {

      throw err;

    }

  }

};

const editDietOptions = {
  accepts: [
    {
      arg: 'diet',
      type: 'Object',
      required: true,
      description: 'A given diet object to be edited.',
    },
    {
      arg: 'dietDetails',
      type: 'array',
      required: true,
      description: [
        'An array with all the edited dietDetails objects that have to ',
        'be related with the main diet object.',
      ],
    },
  ],
  returns: { arg: 'dietId', type: 'Number', root: true },
  http: {
    path: '/editDiet',
    verb: 'put',
  },
  description: [
    'Receive an existing edited diet model as first param and its diet details ',
    'as a second param and upsert/edit them on the database',
  ],
};


module.exports = {

  fullDietRegistration: {
    remoteMethod: fullDietRegistration,
    remoteMethodOptions: fullDietRegistrationOptions,
  },

  editDiet: {
    remoteMethod: editDiet,
    remoteMethodOptions: editDietOptions,
  },

  // Next method

};
