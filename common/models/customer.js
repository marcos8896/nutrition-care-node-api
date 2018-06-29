'use strict';

const app = require('../../server/server');
const CONSTANTS_ROLES = require('../../shared/constants-roles');

module.exports = Customer => {

  /**
   * @description:
   * 'type' property will be added to the instance (user) that will be 
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in
   */
  Customer.beforeRemote('create', (ctx, unused, next) => {
    ctx.req.body.type = CONSTANTS_ROLES.CUSTOMER.REGULAR;
    next();
  })

};
