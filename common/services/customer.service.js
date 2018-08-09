'use strict';

const app = require( '../../server/server' );
const CONSTANTS_ROLES = require( '../../shared/constants-roles' );

/**
 * Dedicated services to handle all the function of the Customer model.
 *
 * @class CustomerService
 */
class CustomerService {

  /**
   * 'type' property will be added to the body request to ensure
   * that every new customer user is regitered as REGULAR customer
   * user.
   *
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static beforeRemoteCreate( ctx, unused, next ) {

    ctx.req.body.type = CONSTANTS_ROLES.CUSTOMER.REGULAR;
    next();

  }

  /**
   * 'type' property will be added to the response that will be
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in.
   *
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static afterRemoteLogin( ctx, response, next ) {

    app.models.Customer.findById( response.userId )
      .then( user => {

        response.type = user.type;
        next();

      })
      .catch( err => next( err ) );

  }

}

module.exports = CustomerService;
