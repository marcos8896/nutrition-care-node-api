'use strict';

const app = require('../../server/server');
const customerService = require('../services/customer.service');

module.exports = Customer => {


  //Before Remote Hooks --->
  Customer.beforeRemote('create', customerService.beforeRemoteCreate);

  //After Remote Hooks --->
  Customer.afterRemote('login', customerService.afterRemoteLogin);

};
