
const app = require('../../server/server');
const CONSTANTS_ROLES = require('../../shared/constants-roles');

const uuid = require('uuid/v4');
const { waterfall } = require('async');

class CustomerService {

  /**
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: 'type' property will be added to the body request to ensure
   * that every new customer user is regitered as REGULAR customer
   * user.
   */
  static beforeRemoteCreate(ctx, unused, next) {
    ctx.req.body.type = CONSTANTS_ROLES.CUSTOMER.REGULAR;
    next();
  }

  /**
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: 'type' property will be added to the response that will be 
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in
   */
  static afterRemoteLogin(ctx, response, next) {

    const RoleMapping = app.models.RoleMapping;

    app.models.Customer.findById(response.userId)
      .then( user => {
        response.type = user.type;
        next();
      })
      .catch( err => next(err));
    
  }

}

module.exports = CustomerService;