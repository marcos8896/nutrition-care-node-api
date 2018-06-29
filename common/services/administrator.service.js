'use strict';

const  uuid = require('uuid/v4');
const { waterfall } = require('async');
const app = require('../../server/server');
const CONSTANTS_ROLES = require('../../shared/constants-roles');


/**
 * @description:
 * Before create a new register, a unique id (built with uuid library)
 * will be added to that request.
 */
function beforeRemoteCreate(ctx, unused, next) {
  ctx.req.body.id = uuid();
  next();
}

/**
* @description:
* 'type' property will be added to the instance (user) that will be 
* returned in the login request. With 'type' property, the client
* application will know which type of user is loggin in
*/
function afterRemoteLogin(ctx, user, next) {
  const RoleMapping = app.models.RoleMapping;
  console.log('user.type: ', user.type);
  user.type = CONSTANTS_ROLES.ADMIN;
  next();
} 

module.exports = {
  beforeRemoteCreate,
  afterRemoteLogin
}