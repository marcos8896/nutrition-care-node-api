'use strict';

/**
 * This module is meant to have all multer shared functionality to handle
 * uploaded files.
 * @module Shared/FilesUtils/MulterUtils
 *
 */


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

module.exports = {
  getMulterDiskStorage,
  imageFilterValidation,
  uploadImage,
};
