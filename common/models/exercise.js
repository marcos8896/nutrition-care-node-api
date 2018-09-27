'use strict';

const ExerciseService = require( '../services/exercise.service' );


module.exports = Exercise => {

  // Validations
  Exercise.validatesLengthOf(
    'name',
    {
      max: 80,
      message: {
        max: 'El nombre no debe de exceder los 80 caracteres.',
      },
    });

  // Custom remote methods
  Exercise.fullExerciseRegistration = ExerciseService
                                          .fullExerciseRegistration.remoteMethod;

  Exercise.remoteMethod(
    'fullExerciseRegistration',
    ExerciseService.fullExerciseRegistration.remoteMethodOptions,
  );

};
