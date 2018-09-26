'use strict';

jest.unmock( 'axios' );

const FormData = require( 'form-data' );
const fs = require( 'fs' );

const { integrationTestSetup } = require( '../../../../dev/testing/environment-utils' );

const {
  getFakeModelsArray,
  findSeedModel,
} = require( '../../../../dev/testing/fixtures-utils' );

const {
  createAdminApiAuth,
  createRegularCustomerApiAuth,
  createAuthenticatedAdmin,
} = require( '../../../../dev/testing/auth-utils' );

const {
  resetTables,
} = require( '../../../../dev/testing/database-utils' );

const app = require( '../../../../server/server' );

const { BodyArea, BodyArea_Exercise_Detail, Exercise } = app.models;

let server, seedModels, bodyAreaModel, bodyAreaExerciseModel, exerciseModel,
  apiPort, baseURL;

const currentModels = [
  'BodyArea', 'BodyArea_Exercise_Detail', 'Administrator', 'Customer', 'Exercise',
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


describe( 'ACLs from Exercise model', () => {

  beforeAll( () => {

    bodyAreaModel = findSeedModel( seedModels, 'BodyArea' );
    exerciseModel = findSeedModel( seedModels, 'Exercise' );

  });

  it( 'should ALLOW an Administrator user to use fullExerciseRegistration endpoint',

    async () => {

      // Arrange

      const fileExists = require( 'file-exists' );
      const resolve = require( 'path' ).resolve;

      const { credentials } = await createAuthenticatedAdmin( baseURL );

      const axios = require( 'axios' );
      const formData = new FormData();

      const multiPartAxios = axios.create({
        baseURL: baseURL,
        headers: {
          ...formData.getHeaders(),
          'Authorization': credentials.id,
        },
      });

      const exercise = getFakeModelsArray( exerciseModel, 1 )[0];
      const bodyAreas = getFakeModelsArray( bodyAreaModel, 5 );


      // Act

      // Create bodyAreas to be able to use them in following requests.
      const createdBodyAreas = await BodyArea.create( bodyAreas );

      const url = '/Exercises/fullExerciseRegistration';
      formData.append( 'exercise', JSON.stringify({ name: exercise.name }) );
      formData.append( 'bodyAreaDetails', JSON.stringify( createdBodyAreas ) );
      formData.append( 'fileImage', fs.createReadStream(
          resolve( './storage/exercises/exercise_example.jpg' )
          ) );


      const response = await multiPartAxios.post( url, formData )
      .catch( e => {

        throw e;

      });

      const registeredExercise = await Exercise.findById( response.data.exerciseId );


      // Assert:
      expect( response.status ).toBe( 200 );
      expect( await Exercise.count() ).toBe( 1 );
      expect( await BodyArea_Exercise_Detail.count() ).toBe( 5 );
      expect( registeredExercise.name ).toBe( exercise.name );

      const exerciseImageExist = await fileExists(
        resolve( './storage/exercises/' + registeredExercise.imageName )
      );

      // The image exist on the exercises folder
      expect( exerciseImageExist ).toBe( true );


    });

});
