'use strict';

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  createAdminApiAuth,
  // createCustomerApiAuth,
} = require( '../../../../dev/testing/auth-utils' );

const {
  resetTables,
} = require( '../../../../dev/testing/database-utils' );

const app = require( '../../../../server/server' );

const { BodyArea } = app.models;

let server, seedModels, bodyAreaModel;

const testingPort = process.env.TEST_API_PORT;
const baseURL = `http://${process.env.TEST_API_HOST}:${testingPort}/api`;
//---------------------------------------------------------------------

beforeAll( async () => {

  const [models] = await Promise.all( [
    getModelsSeeds(),
    resetTables(
      app.dataSources.mysql_ds,
      ['BodyArea', 'BodyArea_Exercise_Detail', 'Administrator', 'Customer']
    ),
  ] );

  seedModels = models;

});

beforeEach( done => server = app.listen( done ) );


afterEach( async () => {

  await resetTables(
    app.dataSources.mysql_ds,
    ['BodyArea', 'BodyArea_Exercise_Detail', 'Administrator', 'Customer']
  );
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
