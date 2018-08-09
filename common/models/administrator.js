'use strict';

const AdministratorService = require( '../services/administrator.service' );

module.exports = function( Administrator ) {

  // Before Remote Hooks --->
  Administrator.beforeRemote(
    'create', AdministratorService.beforeRemoteCreate
  );

  // After Remote Hooks --->
  Administrator.afterRemote(
    'login', AdministratorService.afterRemoteLogin
  );

};
