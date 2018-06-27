'use strict';

module.exports = function(Exercise) {

  //Validations
  Budgetkey.validatesLengthOf('name', {max: 80, message: {max: 'El nombre no debe de exceder los 80 caracteres.'}});

};
