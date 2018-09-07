'use strict';

jest.unmock( 'axios' );

const { integrationTestSetup } = require( '../../../../dev/testing/environment-utils' );

const { resetTables } = require( '../../../../dev/testing/database-utils' );

const {
  createApiUnauth,
  createRegularCustomerApiAuth,
} = require( '../../../../dev/testing/auth-utils' );

const {
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const app = require( '../../../../server/server' );

let server, seedModels, apiPort, baseURL;
const { Diet, Diet_Food_Detail } = app.models;
const currentModels = ['Diet', 'Diet_Food_Detail', 'Customer', 'Administrator'];

//---------------------------------------------------------------------

const resetCurrentModels = () => {

  return resetTables(
    app.dataSources.mysql_ds,
    currentModels,
  );

};

beforeAll( async () => {

  const {
    retunedApiPort,
    retunedBaseURL,
    retunedSeedModels,
  } = await integrationTestSetup({
    datasource: app.dataSources.mysql_ds,
    dbModelsToReset: currentModels,
  });

  apiPort = retunedApiPort;
  baseURL = retunedBaseURL;
  seedModels = retunedSeedModels;

});


beforeEach( () => server = app.listen( apiPort ) );

afterEach( async () => {

  await resetCurrentModels();
  server.close();

});

describe( 'fullDietRegistration endpoint', () => {

  let dietSeedModel, dietSeedDetails;

  beforeAll( async () => {

    dietSeedModel = findSeedModel( seedModels, 'Diet' );
    dietSeedDetails = findSeedModel( seedModels, 'Diet_Food_Detail' );

  });

  // eslint-disable-next-line max-len
  it( 'it should not be able to registered a new diet without being authenticated', async () => {

    const { Diet, Diet_Food_Detail } = app.models;

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const apiUnauth = createApiUnauth( baseURL );

    const response = await apiUnauth.post(
      '/Diets/fullDietRegistration',
      { diet, dietDetails }
    ).catch( e => e.response );

    const [dietCount, dietDetailCount] = await Promise.all( [
      Diet.count(),
      Diet_Food_Detail.count(),
    ] );

    expect( response.status ).toBe( 401 );
    expect( dietCount ).toBe( 0 );
    expect( dietDetailCount ).toBe( 0 );

  });

  // eslint-disable-next-line max-len
  it( 'it should register a new customer user and create a diet with the customer token', async () => {

    const { customer, apiCustomerAxios } = await createRegularCustomerApiAuth( baseURL );

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    diet.customerId = customer.id;
    const dietDetails = getFakeModelsArray( dietSeedDetails, 2 );

    const response = await apiCustomerAxios
      .post( '/Diets/fullDietRegistration', { diet, dietDetails });

    const dietId = response.data.dietId;

    const [dietById, dietCount, detailsCount] = await Promise.all( [

      Diet.findById( dietId ),

      Diet.count(),

      Diet_Food_Detail.count(),
    ] );

    expect( dietById ).toBeDefined();
    expect( dietCount ).toBe( 1 );
    expect( detailsCount ).toBe( 2 );
    expect( dietById.customerId ).toEqual( customer.id );

  });

  it( 'it shouldn\'t register a diet without valid dietDetails', async () => {

    const { customer, apiCustomerAxios } = await createRegularCustomerApiAuth( baseURL );

    const diet = getFakeModelsArray( dietSeedModel, 1 )[0];
    diet.customerId = customer.id;
    const dietDetails = [{ invalid: 'record' }];

    await apiCustomerAxios
      .post( '/Diets/fullDietRegistration', { diet, dietDetails })
      .catch( err => err );

    const [dietCount, detailsCount] = await Promise.all( [
      Diet.count(),
      Diet_Food_Detail.count(),
    ] );

    expect( dietCount ).toBe( 0 );
    expect( detailsCount ).toBe( 0 );

  });


});
