'use strict';

const DietService = require( '../services/diet.service' );
const DietHooks = require( '../hooks/diet.hooks' );

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

  // Remote hooks
  Diet.beforeRemote( 'editDiet', DietHooks.validateOwnerEditDiet );

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
