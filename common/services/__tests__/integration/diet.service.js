'use strict';

const axios = require( 'axios' );

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const app = require( '../../../../server/server' );

jest.unmock( 'axios' );

let server, seedModels;
const testingPort = 8089;
const baseURL = `http://localhost:${testingPort}/api`;

const axiosOptions = {
  baseURL: baseURL,
  headers: [
        { 'content-type': 'application/json' },
  ],
};

const apiUnauth = axios.create( axiosOptions );

beforeAll( async () => {

  seedModels = await getModelsSeeds();

});

beforeEach( function( done ) {

  server = app.listen( done );

});

afterEach( function( done ) {

  server.close( done );

});


describe( 'fullDietRegistration endpoint', () => {


  let dietSeedModel, dietSeedDetails;

  beforeAll( async () => {

    dietSeedModel = findSeedModel( seedModels, 'Diet' );
    dietSeedDetails = findSeedModel( seedModels, 'Diet_Food_Detail' );

  });

  it( 'it should not be able to registered a new diet without being authenticated', async () => {

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const response = await apiUnauth.post( '/Diets/fullDietRegistration', { diet, dietDetails })
     .catch( e => e.response );

    expect( response.status ).toBe( 401 );

  });

  it( 'it should register a new customer user and create a diet with his token', async () => {

    const customerSeeModel = findSeedModel( seedModels, 'Customer' );
    const customer = getFakeModelsArray( customerSeeModel, 1 )[0];

    // Create new customer user.
    await apiUnauth.post( '/Customers', customer )
      .catch( err => console.log( err.response.data.error ) );

    const loginResponse = await apiUnauth.post( '/Customers/login', {
      email: customer.email,
      password: customer.password,
    });
    // .catch( err => console.log( err.response.data.error ) );


    const apiAuth = axios.create({
      ...axiosOptions,
      headers: {
        ...axiosOptions.headers,
        'Authorization': loginResponse.data.id,
      },
    });

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const response = await apiAuth
      .post( '/Diets/fullDietRegistration', { diet, dietDetails });

    console.log( 'data: ', response.data );

    // const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    // const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    // const response = await apiUnauth.post( endpoint, { diet, dietDetails })
    //  .catch( e => e.response );

    // expect( response.status ).toBe( 401 );

  });


});
