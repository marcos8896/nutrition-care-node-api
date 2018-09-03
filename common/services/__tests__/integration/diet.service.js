'use strict';

const axios = require( 'axios' );

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  resetTables,
} = require( '../../../../dev/testing/database-utils' );

const app = require( '../../../../server/server' );

jest.unmock( 'axios' );

let server, seedModels;

const testingPort = process.env.TEST_API_PORT;
const baseURL = `http://${process.env.TEST_API_HOST}:${testingPort}/api`;

const axiosOptions = {
  baseURL: baseURL,
  headers: [
        { 'content-type': 'application/json' },
  ],
};

const apiUnauth = axios.create( axiosOptions );

//---------------------------------------------------------------------

beforeAll( async () => {

  seedModels = await getModelsSeeds();

});

beforeEach( done => server = app.listen( done ) );


afterEach( async () => {

  await resetTables( app.dataSources.mysql_ds, ['Diet', 'Diet_Food_Detail', 'Customer'] );
  server.close();

});

const createAuthenticatedCustomer = async () => {

  const customerSeeModel = findSeedModel( seedModels, 'Customer' );
  const customer = getFakeModelsArray( customerSeeModel, 1 )[0];

    // Create new customer user.
  await apiUnauth.post( '/Customers', customer )
      .catch( err => {

        throw err;

      });

  const loginResponse = await apiUnauth.post( '/Customers/login', {
    email: customer.email,
    password: customer.password,
  });

  return {
    customer: { ...customer, id: loginResponse.data.userId },
    credentials: loginResponse.data,
  };

};

const createApiAuth = ( userToken ) => {

  return axios.create({
    ...axiosOptions,
    headers: {
      ...axiosOptions.headers,
      'Authorization': userToken,
    },
  });

};


describe( 'fullDietRegistration endpoint', () => {

  let dietSeedModel, dietSeedDetails;

  beforeAll( async () => {

    dietSeedModel = findSeedModel( seedModels, 'Diet' );
    dietSeedDetails = findSeedModel( seedModels, 'Diet_Food_Detail' );

  });

  // eslint-disable-next-line max-len
  it( 'it should not be able to registered a new diet without being authenticated', async () => {

    const { Diet, Diet_Food_Detail } = app.models;// eslint-disable-line camelcase

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const response = await apiUnauth.post(
      '/Diets/fullDietRegistration',
      { diet, dietDetails }
    )
      .catch( e => e.response );

    expect( response.status ).toBe( 401 );

    expect( await Diet.count() ).toBe( 0 );
    expect( await Diet_Food_Detail.count() ).toBe( 0 );// eslint-disable-line camelcase

  });

  // eslint-disable-next-line max-len
  it( 'it should register a new customer user and create a diet with his token', async () => {

    // eslint-disable-next-line camelcase
    const { Diet, Diet_Food_Detail, Customer } = app.models;

    const { credentials } = await createAuthenticatedCustomer();

    // .catch( err => console.log( err.response.data.error ) );
    const apiAuth = createApiAuth( credentials.id );

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const response = await apiAuth
      .post( '/Diets/fullDietRegistration', { diet, dietDetails });

    const dietId = response.data.dietId;

    expect( await Diet.findById( dietId ) ).toBeDefined();
    expect( await Customer.count() ).toBe( 1 );
    expect( await Diet.count() ).toBe( 1 );
    expect( await Diet_Food_Detail.count() ).toBe( 2 );// eslint-disable-line camelcase

  });

  // eslint-disable-next-line max-len
  // it( 'it should register a new diet related with a customer', async () => {

  //   // eslint-disable-next-line camelcase
  //   const { Diet, Diet_Food_Detail, Customer } = app.models;

  //   const { customer, credentials } = await createAuthenticatedCustomer();
  //   // .catch( err => console.log( err.response.data.error ) );
  //   const apiAuth = createApiAuth( credentials.id );

  //   const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
  //   const dietDetails = getFakeModelsArray( dietSeedDetails, 10 );

  //   const response = await apiAuth
  //     .post( '/Diets/fullDietRegistration', { diet, dietDetails });

  //   const dietId = response.data.dietId;

  //   expect( await Diet.findById( dietId ).customerId ).toBe( customer.id );

  // });


});
