'use strict';

const app = require( '../../server/server' );
/**
 * Receives a new routine model as first param and its routine details as a second param,
 * creates them on the database and makes the relations between them in one
 * database transaction.
 * @param {Object} routine The given routine to be registered.
 * @param {array} routineDetails An array with all the routineDetails objects that
 * have to be related with the main routine object.
 * @author Brandon Villa <bornofos@gmail.com>
 * @returns {Object} An object with the already created routineId
 */
const fullRoutine = async ( routine, routineDetails ) => {

  const { Routine, Exercise_Routine_Detail } = app.models;

  let transaction;

  try {

    // Creates low level Loopback transaction.
    transaction = await Routine.beginTransaction({
      isolationLevel: Routine.Transaction.REPEATABLE_READ,
    });

    // Sets transaction options.
    const options = { transaction };

    // Gets the registeredRoutine id.
    const registeredRoutine = await Routine.create( routine, options );
    const { id } = registeredRoutine;
    // Sets the registeredRoutine id to every single routineDetails.
    const routineDetailsWithId = routineDetails.map( item => {

      return { ...item, routineId: id  };

    });
    // Creates all the Exercise_Routine_Detail records.
    await Exercise_Routine_Detail.create( routineDetailsWithId, options );

    // Attempts to commit all the changes.
    await transaction.commit();
    // Returns the routineId to the client.
    return { routineId: id };


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
const fullRoutineOptions = {
  accepts: [
    {
      arg: 'routine',
      type: 'Object',
      required: true,
      description: 'A given routine object to be registered.',
    },
    {
      arg: 'routineDetails',
      type: 'array',
      required: true,
      description: [
        'An array containing all the routineDetails ',
      ],
    },
  ],
  returns: { arg: 'routineId', type: 'Number', root: true },
  http: {
    path: '/fullRoutine',
    verb: 'post',
  },
  description: [
    'It receives a new Routine model passed as a param. ',
    'A second param is an array containing all the routine details',
  ],
};

module.exports = {

  fullRoutine: {
    remoteMethod: fullRoutine,
    remoteMethodOptions: fullRoutineOptions,
  },
};
