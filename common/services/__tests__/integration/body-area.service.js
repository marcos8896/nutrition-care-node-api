'use strict';

jest.unmock( 'axios' );

const { integrationTestSetup } = require( '../../../../dev/testing/environment-utils' );

const {
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  createAdminApiAuth,
} = require( '../../../../dev/testing/auth-utils' );

const {
  resetTables,
} = require( '../../../../dev/testing/database-utils' );

const app = require( '../../../../server/server' );

const { BodyArea } = app.models;

let server, seedModels, bodyAreaModel, apiPort, baseURL;

const currentModels = [
  'BodyArea', 'BodyArea_Exercise_Detail', 'Administrator', 'Customer',
];

const resetCurrentModels = () => resetTables( app.dataSources.mysql_ds, currentModels );

//---------------------------------------------------------------------

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


describe( 'ACLs from BodyArea model', () => {

  beforeAll( () => {

    bodyAreaModel = findSeedModel( seedModels, 'BodyArea' );

  });

  it( 'should ALLOW an Administrator user to create BodyArea records', async () => {

    const { apiAdminAxios } = await createAdminApiAuth( baseURL );
    const bodyArea = getFakeModelsArray( bodyAreaModel, 1 )[0];

    const response = await apiAdminAxios.post( '/BodyAreas', bodyArea )
      .catch( e => e.response );
    const registeredBodyArea = response.data;

    const bodyAreaCount = await BodyArea.count();

    expect( registeredBodyArea.description ).toBe( bodyArea.description );
    expect( bodyAreaCount ).toBe( 1 );

    // const msessage = { port: server.address().port };
    // throw message;


  });


//   it.only( 'should DENY an authenticated non-admin user to create BodyArea records', async () => {

//     const { apiCustomerAxios } = await createCustomerApiAuth();
//     const bodyArea = getFakeModelsArray( bodyAreaModel, 1 )[0];
//     const [response, bodyAreaCount] = await Promise.all( [

//       apiAdminAxios.post(
//         '/BodyAreas',
//         bodyArea
//       ).catch( e => e.response ),

//       BodyArea.count(),

//     ] );

//     throw response.data;

//   });



});
