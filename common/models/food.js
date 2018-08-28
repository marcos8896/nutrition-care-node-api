'use strict';

const {
  beforeCreateValidateFoodNutrients,
} = require( '../services/food.service' );


module.exports = function( Food ) {

  Food.validatesLengthOf(
    'description',
    {
      max: 80,
      message: {
        max: 'La descripción no debe sobrepasar los 80 caracteres.',
      },
    });

  // Before Remote Hooks --->
  Food.beforeRemote(
    'create', beforeCreateValidateFoodNutrients
  );

};
