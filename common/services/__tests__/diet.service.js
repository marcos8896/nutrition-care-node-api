'use strict';

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../dev/testing/fixtures-utils' );

let server;
let seedModels;

beforeAll( async () => {

  console.log( 'NODE_ENV', process.env.NODE_ENV );
  server = require( '../../../server/server' );
  seedModels = await getModelsSeeds();

});

beforeEach( () => {

// server = util.promisify( app );

});

describe( 'fullDietRegistration endpoint', async () => {

  it( 'should register a diet with its diet detail records', () => {

    const dietSeedModel = findSeedModel( seedModels, 'Diet' );
    const dietSeedDetails = findSeedModel( seedModels, 'Diet_Food_Detail' );

    const dietRecords = getFakeModelsArray( dietSeedModel, 1 );
    const dietDetailRecords = getFakeModelsArray( dietSeedDetails, 20 );


    console.log( 'dietRecords: ', dietRecords );
    console.log( 'dietDetailRecords: ', dietDetailRecords );

    expect( true ).toBe( true );

  });

});
