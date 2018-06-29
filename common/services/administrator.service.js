const app = require('../../server/server');
const CONSTANTS_ROLES = require('../../shared/constants-roles');

const  uuid = require('uuid/v4');
const { waterfall } = require('async');

class AdministratorService {

  /**
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: Before create a new register, a unique id (built with uuid library)
   * will be added to that request.
   */
  static beforeRemoteCreate(ctx, unused, next) {
    ctx.req.body.id = uuid();
    next();
  }

  /**
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: 'type' property will be added to the instance (user) that will be 
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in
   */
  static afterRemoteLogin(ctx, user, next) {
    const RoleMapping = app.models.RoleMapping;
    user.type = CONSTANTS_ROLES.ADMIN;
    next();
  } 

}

module.exports = AdministratorService;