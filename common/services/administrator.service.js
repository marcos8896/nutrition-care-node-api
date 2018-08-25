
'use strict';

const CONSTANTS_ROLES = require( '../../shared/constants-roles' );

const  uuid = require( 'uuid/v4' );

/**
 * Dedicated services to handle all the function of the Administrator model.
 *
 * @class AdministratorService
 */
class AdministratorService {

  /**
   * Before create a new register, a unique id (built with uuid library)
   * will be added to that request.
   *
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static beforeRemoteCreate( ctx, unused, next ) {

    ctx.req.body.id = uuid();
    next();

  }

  /**
   * type' property will be added to the instance (user) that will be
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in.
   *
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static afterRemoteLogin( ctx, user, next ) {

    user.type = CONSTANTS_ROLES.ADMIN;
    next();

  }

  /**
   * type' property will be added to the instance (user) that will be
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in.
   *
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static afterRemoteFindById( ctx, user, next ) {

    user.type = CONSTANTS_ROLES.ADMIN;
    next();

  }

}

module.exports = AdministratorService;
