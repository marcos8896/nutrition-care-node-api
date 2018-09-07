'use strict';

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  createAdminApiAuth,
} = require( '../../../../dev/testing/auth-utils' );

const {
  resetTables,
} = require( '../../../../dev/testing/database-utils' );

const {
  getBaseURLWithPort,
  createTestingDatabase,
  getApiTestPort,
} = require( '../../../../dev/testing/environment-utils' );

const app = require( '../../../../server/server' );

const { BodyArea } = app.models;

let server, seedModels, bodyAreaModel, apiPort, baseURL;

const resetCurrentModels = () => {

  return resetTables(
    app.dataSources.mysql_ds,
    ['BodyArea', 'BodyArea_Exercise_Detail', 'Administrator', 'Customer']
  );

};
//---------------------------------------------------------------------

beforeAll( async () => {

  const [allModelSeeds] = await Promise.all( [
    getModelsSeeds(),
    createTestingDatabase(),
  ] ).catch( err => {

    throw err;

  });

  apiPort = getApiTestPort();
  baseURL = getBaseURLWithPort( apiPort );
  seedModels = allModelSeeds;

  await resetCurrentModels();

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
