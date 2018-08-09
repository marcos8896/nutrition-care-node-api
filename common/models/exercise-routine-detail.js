'use strict';

module.exports = function( Exerciseroutinedetail ) {

  Exerciseroutinedetail.validatesLengthOf(
    'description',
    {
      max: 250,
      message: {
        max: 'La descripción no debe sobrepasar los 250 caracteres.',
      },
    });

};
