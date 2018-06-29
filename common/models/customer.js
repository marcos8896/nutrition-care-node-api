'use strict';
const CONSTANTS_ROLES = require('../../shared/constants-roles');

module.exports = Customer => {

  Customer.beforeRemote('create', (ctx, unused, next) => {
    ctx.req.body.customer_role = CONSTANTS_ROLES.CUSTOMER.REGULAR;
    next();
  })

};
