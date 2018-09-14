
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

  try {

    // This is required to get all the parsed form data from
    // the 'req' object. Without this, it won't be possible
    // to get the data from the 'req' object.
    await parseMultiPartFormData( req );
    console.log( 'req.body', req.body );

    return 'test';

  } catch ( error ) {

    console.log( 'on error' );
    console.log( 'error: ', error );

    throw error;

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
 *
 * Parse the 'req' loopback object to check if there
 * are multi-part/form-data on it. It will check for a
 * 'fileImage' param on the FormData which will have to
 * contain an image with a size lower tha 1MB to be
 * processed and uploaded.
 * Note: It is REQUIRED to wait all this process to finish
 * in order to get the non-file fields from the request
 * object.
 * @param {Object} req The loopback/express request object
 * @returns {Promise} Returns a promise to be able
 * to wait for multer to parse the multi-part/form-data
 * in the 'req' object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
const parseMultiPartFormData = ( req ) => {

  const multer = require( 'multer' );

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

/**
 * Create a simple diskStorage multer configuration based on a multer instance
 * a root destination path in which the file(s) will be storaged and a file
 * prefix to append it at the beginning of the name file.
 *
 * @param {Object} options { multer, destination, filePrefix = 'file' }
 * @param {Object} options.multer A multer instance.
 * @param {String} options.destination A root destination path for the files.
 * @param {String} options.filePrefix A prefix for the filename.
 * @returns {Object} Returns a configurated multer storage instance.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
const getMulterDiskStorage = ({ multer, destination, filePrefix = 'file' }) => {

  const storage = multer.diskStorage({
    destination: destination,
    filename: ( req, file, cb ) => {

      var { extension } = require( 'mime-types' );
      const newFileName = filePrefix + '-' + new Date().getTime() + '.' +
                          extension( file.mimetype );

      return cb( null, newFileName );

    },
  });

  return storage;

};

/**
 * A function that is meant to be used as fileFilter in the multer options.
 * This function validate if a given file is an images with the one of the
 * following mime types:
 * 'image/jpg', 'image/jpeg', 'image/png', 'image/gif'
 *
 * If the given file is not an image, the function will passed an error to
 * the next callback (cb).
 *
 * @param {Object} unsusedReq The req object (which is not used in this case)
 * @param {Object} file The incoming file to be validated.
 * @param {Callback} cb A given multer callback.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
const imageFilterValidation = ( unsusedReq, file, cb ) => {

  const allowedContentTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

  if ( !allowedContentTypes.includes( file.mimetype ) )
    return cb( new Error( 'The file has to be a png, jpg or gif image' ) );
  else
    return cb( null, true );

};


/**
 * A function that will attempt to save the incoming image file(s).
 * It will create a promise which will be fullfilled or rejected once
 * completed.
 *
 * @param {Object} req The loopback/express request object
 * @param {Object} uploadConfiguration An already multer configurated
 * instance with all the options and with at least one call to one of
 * the initialized initializer methods from multer (e.g. .single(...),
 * .array(...), .fields(...), etc)
 * @returns {Promise} Returns a promise to allow the caller function
 * to await the uploading process to complete.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 *
 */
const uploadImage = ( req, uploadConfiguration ) => {

  return new Promise( ( resolve, reject ) => {

    uploadConfiguration( req, null, function( err ) {

      if ( err ) return reject( err );
      // Everything went fine
      return resolve();

    });

  });

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
    'Receives a new exercise model as first param and its body area details ',
    'as a second param and creates them on the database',
  ],
};

module.exports = {

  fullExerciseRegistration: {
    remoteMethod: fullExerciseRegistration,
    remoteMethodOptions: fullExerciseRegistrationOptions,
  },

  //Next method

};
