'use strict';

const CustomerService = require( '../services/customer.service' );

module.exports = Customer => {


  // Before Remote Hooks --->
  Customer.beforeRemote( 'create', CustomerService.beforeRemoteCreate );

  // After Remote Hooks --->
  Customer.afterRemote( 'login', CustomerService.afterRemoteLogin );

};
