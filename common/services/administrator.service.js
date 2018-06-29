const   app = require('../../server/server'),
        uuid = require('uuid/v4'),
        { waterfall } = require('async');
        CONSTANTS_ROLES = require('../../shared/constants-roles');


/**
 * Remote hook description:
 * Before create a new register, a unique id (built with uuid library)
 * will be added to that request.
 */
function beforeRemoteCreate(ctx, unused, next) {
  ctx.req.body.id = uuid();
  next();
}

/**
* Remote hook description:
* 'type' property will be added to the instance (user) that will be 
* returned in the login request. With 'type' property, the client
* application will know which type of user is loggin in
*/
function afterRemoteLogin(ctx, user, next) {
  const RoleMapping = app.models.RoleMapping;
  user.type = CONSTANTS_ROLES.ADMIN;
  next();
} 