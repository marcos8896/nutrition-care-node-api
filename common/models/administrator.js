'use strict';

const administratorService = require('../services/administrator.service');

module.exports = function(Administrator) {
  
  /**
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: Before create a new register, a unique id (built with uuid library)
   * will be added to that request.
   */
  Administrator.beforeRemote('create', administratorService.beforeRemoteCreate);


  /**
   * @author Brandon Emmanuel Villa Cárdenas <bornofos@gmail.com>
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: 'type' property will be added to the instance (user) that will be 
   * returned in the login request. With 'type' property, the client
   * application will know which type of user is loggin in
   */
  Administrator.afterRemote('login', administratorService.afterRemoteLogin);
    

};
