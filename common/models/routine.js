'use strict';

module.exports = function(Routine) {

  //Validations
  Budgetkey.validatesLengthOf('description', {max: 250, message: {max: 'La descripción no debe de exceder los 250 caracteres.'}});

};
