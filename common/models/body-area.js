'use strict';

module.exports = function( Bodyarea ) {

  Bodyarea.validatesLengthOf(
    'description',
    {
      max: 80,
      message: {
        max: 'La descripción no debe sobrepasar los 80 caracteres.',
      },
    });

};
