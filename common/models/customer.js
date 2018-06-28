'use strict';
const CUSTOMER_ROLES = require('../../shared/customer-roles');

module.exports = Customer => {

  Customer.beforeRemote('create', (ctx, unused, next) => {
    ctx.req.body.customer_role = CUSTOMER_ROLES.REGULAR;
    next();
  })

};
