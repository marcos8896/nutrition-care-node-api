'use strict';

const app = require('../../server/server');
const customerService = require('../services/customer.service');

module.exports = Customer => {


  //Before Remote Hooks --->
  Customer.beforeRemote('create', customerService.beforeRemoteCreate);

  /**
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: 'type' property will be added to the response that will be 
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in
   */
  Customer.afterRemote('login', customerService.afterRemoteLogin);

};
