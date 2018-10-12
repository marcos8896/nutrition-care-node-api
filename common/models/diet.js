'use strict';

const DietService = require( '../services/diet.service' );

module.exports = Diet => {


  // Validations
  Diet.validatesLengthOf(
    'description',
    {
      max: 250,
      message: {
        max: 'Por favor ingresa una descripción más corta. Sólo se permite ' +
             '250 caracteres.',
      },
    });


  //--------------------------------------------------------------------------------


  // Custom remote methods

  Diet.fullDietRegistration = DietService.fullDietRegistration.remoteMethod;
  Diet.remoteMethod(
    'fullDietRegistration',
    DietService.fullDietRegistration.remoteMethodOptions,
  );

  //----------

  Diet.editDiet = DietService.editDiet.remoteMethod;
  Diet.remoteMethod( 'editDiet', DietService.editDiet.remoteMethodOptions );

  //--------------------------------------------------------------------------------


};
