
'use strict';


/**
 * Dedicated services to handle all the exercise related methods.
 *
 * @module ExerciseService
 */

const app = require( '../../server/server' );

/**
 * Receives a new exercise model as first param and its bodyArea details as a
 * second param, creates them on the database and makes the relations between them in one
 * database transaction.
 * @param {Object} exercise The given exercise to be registered.
 * @param {Object[]} bodyAreaDetails An array with all the bodyAreaDetails objects
 * that have to be related with the main exercise object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Object} An object with the already created exerciseId
 */
const fullExerciseRegistration = async ( req ) => {

  const { Exercise, BodyArea_Exercise_Detail } = app.models;
  let transaction;

  try {

    // This is required to get all the parsed form data from
    // the 'req' object. Without this, it won't be possible
    // to get the data from the 'req' object.
    await parseMultiPartFormData( req );

    // Get exercise and imageName from the already parsed req object
    const exercise = {
      ...JSON.parse( req.body.exercise ),
      imageName: req.file.filename,
    };

    // Creates low level Loopback transaction.
    transaction = await Exercise.beginTransaction({
      isolationLevel: Exercise.Transaction.REPEATABLE_READ,
    });

    // Sets transaction options.
    const options = { transaction };

    // Gets the registeredDiet id.
    const registeredExercise = await Exercise.create( exercise, options );
    const { id } = registeredExercise;

    const exerciseBodyAreaDetails = JSON.parse( req.body.bodyAreaDetails )
      .map( item => {

        return { bodyAreaId: item.id, exerciseId: id };

      });

    // Creates all the BodyArea_Exercise_Detail records.
    await BodyArea_Exercise_Detail.create( exerciseBodyAreaDetails );

    // Attempts to commit all the changes.
    await transaction.commit();

    // Returns the dietId to the client.
    return { exerciseId: id };

  } catch ( error ) {

    console.log( 'on error' );
    console.log( 'error: ', error );

    try {

      //     // Attempts to rollback all the changes (it could cause an error itself
      //     // which is why it is required another try/catch).
      await transaction.rollback();
      throw error;

    } catch ( err ) {

      throw err;

    }

  }

  // const { Diet, Diet_Food_Detail } = app.models; //eslint-disable-line

  // let transaction;

  // try {

  //   // Creates low level Loopback transaction.
  //   transaction = await Diet.beginTransaction({
  //     isolationLevel: Diet.Transaction.REPEATABLE_READ,
  //   });

  //   // Sets transaction options.
  //   const options = { transaction };

  //   // Gets the registeredDiet id.
  //   const registeredDiet = await Diet.create( diet, options );
  //   const { id } = registeredDiet;

  //   // Sets the registeredDiet id to every single dietDetails.
  //   const dietDetailsWithId = dietDetails.map( item => {

  //     return { ...item, dietId: id  };

  //   });

  //   // Creates all the Diet_Food_Detail records.
  //   await Diet_Food_Detail.create( dietDetailsWithId, options ); //eslint-disable-line

  //   // Attempts to commit all the changes.
  //   await transaction.commit();

  //   // Returns the dietId to the client.
  //   return { dietId: id };


  // } catch ( error ) {

  //   try {

  //     // Attempts to rollback all the changes (it could cause an error itself
  //     // which is why it is required another try/catch).
  //     await transaction.rollback();
  //     return error;

  //   } catch ( seriousError ) {

  //     return seriousError;

  //   }

  // }

};


/**
 * Parse the 'req' loopback object to check if there are multi-part/form-data on it.
 * It will check for a 'fileImage' param on the FormData which will have to contain
 * an image with a size lower tha 1MB to be processed and uploaded.
 * This method implicitly upload the 'fileImage' image file if all the validations
 * are passed.
 * Note: It is REQUIRED to wait all this process to finish in order to get the
 * non-file fields from the request object.
 * @param {Object} req The loopback/express request object
 * @returns {Promise} Returns a promise to be able
 * to wait for multer to parse the multi-part/form-data
 * in the 'req' object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
const parseMultiPartFormData = ( req ) => {

  const multer = require( 'multer' );

  const {
    getMulterDiskStorage,
    imageFilterValidation,
    uploadImage,
  } = require( '../../shared/files-utils/multer-utils' );


  const multerStorage = getMulterDiskStorage({
    multer: multer,
    destination: 'storage/exercises',
    filePrefix: 'image',
  });

  const maxMegaBytes = 1;
  const multerOptions = {
    limits: {
      fields: 2,
      files: 1,
      fileSize: maxMegaBytes * 1024 * 1024,
    },
    fileFilter: imageFilterValidation,
    storage: multerStorage,
  };

  const uploadConfiguration = multer( multerOptions ).single( 'fileImage' );

  return uploadImage( req, uploadConfiguration );

};


const fullExerciseRegistrationOptions = {
  accepts: [
    { arg: 'req', type: 'Object', http: { source: 'req' } },
  ],
  returns: { arg: 'exerciseId', type: 'Number', root: true },
  http: {
    path: '/fullExerciseRegistration',
    verb: 'post',
  },
  description: [
    'Recieve the raw express/loobpack req object and parse it as multipart/form-data',
    'in order to get a \'fileImage\' file from \'req.file\' ',
    'and the \'exercise\' and \'bodyAreaDetails\' stringify object and array',
    'respectively from \'req.body\' ',
  ],
};

module.exports = {
  fullExerciseRegistration: {
    remoteMethod: fullExerciseRegistration,
    remoteMethodOptions: fullExerciseRegistrationOptions,
  },

  //Next method

};
