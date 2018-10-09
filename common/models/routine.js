'use strict';

const RoutineService = require( '../services/routine.service' );

module.exports =  Routine => {

  // Validations
  // Routine.validatesLengthOf(
  //   'description',
  //   {
  //     max: 250,
  //     message: {
  //       max: 'La descripción no debe de exceder los 250 caracteres.',
  //     },
  //   });

  // Custom remote methods
  Routine.fullRoutine = RoutineService.fullRoutine.remoteMethod;

  Routine.remoteMethod(
    'fullRoutine',
    RoutineService.fullRoutine.remoteMethodOptions,
  );

};
