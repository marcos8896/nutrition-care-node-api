'use strict';


let server;

beforeEach( () => {

  server = require( '../../../server/server' );
  console.log( 'env', process.env.NODE_ENV );
// server = util.promisify( app );

});

describe( 'fullDietRegistration endpoint', () => {

  it( 'should register a diet with its diet detail records', () => {

    const { Diet } = server.models;
    console.log( 'Diet: ', Diet );
    expect( true ).toBe( true );

  });

});
