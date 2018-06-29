'use strict';

const administratorService = require('../services/administrator.service');

module.exports = function(Administrator) {
  
  //Before Remote Hooks --->
  Administrator.beforeRemote('create', administratorService.beforeRemoteCreate);

  //After Remote Hooks --->
  Administrator.afterRemote('login', administratorService.afterRemoteLogin);
    
};
