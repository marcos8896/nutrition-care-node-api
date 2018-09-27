'use strict';

jest.unmock( 'axios' );

const { integrationTestSetup } = require( '../../../../dev/testing/environment-utils' );

const {
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  createAdminApiAuth,
  createRegularCustomerApiAuth,
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
    returnedApiPort,
    returnedBaseURL,
    returnedSeedModels,
  } = await integrationTestSetup({
    datasource: app.dataSources.mysql_ds,
    dbModelsToReset: currentModels,
  });

  apiPort = returnedApiPort;
  baseURL = returnedBaseURL;
  seedModels = returnedSeedModels;

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

  });


  it( 'should DENY an authenticated non-admin user to create BodyArea records',
    async () => {

      const { apiCustomerAxios } = await createRegularCustomerApiAuth( baseURL );
      const bodyArea = getFakeModelsArray( bodyAreaModel, 1 )[0];
      const statusCode = await apiCustomerAxios.post( '/BodyAreas', bodyArea )
        .catch( e => e.response.status );

      const bodyAreaCount = await BodyArea.count();

      // Not authorized status code
      expect( statusCode ).toBe( 401 );
      expect( bodyAreaCount ).toBe( 0 );

    }
  );



});
