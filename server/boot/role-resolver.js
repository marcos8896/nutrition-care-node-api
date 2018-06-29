const CONSTANTS_ROLES = require('../../shared/constants-roles');

module.exports = app => {
  const Role = app.models.Role;

  /**
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   * @description: This role resolver checks if the current
   * user is a customer and if so, then it proceeds to verifies
   * if that customer is a premium one.
   */
  Role.registerResolver('premium', (_, context, cb) => {

    function reject() { process.nextTick(() => cb(null, false)) }

    //Do not allow anonymous users.
    const userId = context.accessToken.userId;
    if (!userId) return reject();

    app.models.Customer.findById(userId)
      .then(customer => {
        
        //Check if the current user is a PREMIUM customer.
        if(customer.type === CONSTANTS_ROLES.CUSTOMER.PREMIUM)
          return cb(null, true);
        else
          return reject();

      })
      .catch(err => reject());
      
  });

};


