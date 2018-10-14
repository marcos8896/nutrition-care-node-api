
'use strict';


/**
 * Dedicated hooks to handle all the diet related hooks.
 *
 * @module DietHooks
 */

const createError = require( 'http-errors' );

const app = require( '../../server/server' );

/**
 * Validate if the current user token belongs to the diet owner.
 * @param {Object} ctx Context Loopback object.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
const validateOwnerEditDiet = async ( ctx ) => {

  const { Diet, Role } = app.models;

  const dietId = ctx.req.body.diet.id;
  const { id, userId } = ctx.req.accessToken;

  const isOwner = await Role.isOwner(
    Diet, dietId, userId,
    null, { accessToken: id }
  );

  if ( isOwner !== true ) throw createError( 401, 'Not authorized to edit this record' );

  return;

};

module.exports = {

  validateOwnerEditDiet,
  // Next hook

};
