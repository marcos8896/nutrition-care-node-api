'use strict';

/**
 * Contains authentication functionality to be able to test
 * properly as a customer user or as an admin user
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Testing/Auth-utils
 */

const USER_ROLES = require( '../../shared/constants-roles' );

const {
  getModelsSeeds,
  getFakeModelsArray,
  findSeedModel,
} = require( './fixtures-utils' );

const app = require( '../../server/server' );
const axios = require( 'axios' );
const adminUserRole = require( '../../common/roles/static-users/administrator' );

/**
 * Generate and authenticate a new admin user in the testing
 * database.
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated admin user and his credentials.
 * @async
 */
const createAuthenticatedAdmin = async ( baseURL ) => {

  const seedModels = await getModelsSeeds();

  const admin = await createAdminUserWithRole( seedModels );

  const apiUnauth = createApiUnauth( baseURL );
  const loginResponse = await apiUnauth.post( '/Administrators/login', {
    email: admin.email,
    password: admin.password,
  });


  return {
    admin: { ...admin, id: loginResponse.data.userId },
    credentials: loginResponse.data,
  };

};


/**
 * Generate a new user in the database and bound it to the
 * 'Administrator' role to allow the said user to login as an
 * Admin user.
 *
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated admin user and his credentials.
 * @async
 */
const createAdminUserWithRole = async seedModels => {

  const { Administrator, Role, RoleMapping } = app.models;

  const adminSeedModel = findSeedModel( seedModels, 'Administrator' );
  const admin = getFakeModelsArray( adminSeedModel, 1 )[0];
  admin.email = 'admin@admin.com';

  // Create new user in the database.
  const registeredAdmin = await Administrator.create( admin );

  // Create the 'Administrator' role in the database.
  const role = await Role.create({
    name: adminUserRole.roleName,
    description: adminUserRole.rolDescription,
  });

  // Bound the registeredAdmin to the Administrator role.
  await role.principals.create({
    principalType: RoleMapping.USER,
    principalId: registeredAdmin.id,
  });

  return admin;

};


/**
 * Generate an authenticate customer user in the testing
 * database.
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param customerType - The wanted customer type
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated customer user and his credentials.
 * @async
 */
const createAuthenticatedCustomer = async (
  baseURL, customerType = USER_ROLES.CUSTOMER.REGULAR
) => {

  const { Customer } = app.models;

  const seedModels = await getModelsSeeds();

  const customerSeeModel = findSeedModel( seedModels, 'Customer' );
  const customer = getFakeModelsArray( customerSeeModel, 1 )[0];
  customer.type = customerType;
  customer.email = 'customer@customer.com';


  await Customer.create( customer );

  const apiUnauth = createApiUnauth( baseURL );
  const loginResponse = await apiUnauth.post( '/Customers/login', {
    email: customer.email,
    password: customer.password,
  });

  return {
    customer: { ...customer, id: parseInt( loginResponse.data.userId ) },
    credentials: loginResponse.data,
  };

};


/**
 * Generate a new user in the database and bound it to the
 * 'Administrator' role to allow the said user to login as an
 * Admin user
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated admin user, his credentials and and axios instance with
 * Admin authentication.
 * @async
 */
const createAdminApiAuth = async ( baseURL ) => {

  const { admin, credentials } = await createAuthenticatedAdmin( baseURL );

  const axiosOptions = {
    baseURL: baseURL,
    headers: {
      'content-type': 'application/json',
      'Authorization': credentials.id,
    },
  };

  return {
    apiAdminAxios: axios.create( axiosOptions ),
    admin,
    adminCredentials: credentials,
  };

};


/**
 * Generate an authenticated new regular customer user in the database and
 * allow the said user to login as a regular customer user
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated regular customer user, his credentials and an axios
 * instance with regular customer authentication.
 * @async
 */
const createRegularCustomerApiAuth = async ( baseURL ) => {

  const { customer, credentials } = await createAuthenticatedCustomer(
    baseURL,
    USER_ROLES.CUSTOMER.REGULAR
  );

  return {
    customer,
    customerCredentials: credentials,
    apiCustomerAxios: createCustomerApiAuth( baseURL, credentials.id ),
  };

};


/**
 * Generate an authenticated new premium customer user in the database and
 * allow the said user to login as a premium customer user
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Returns an object that contains a generated
 * authenticated premium customer user, his credentials and an axios
 * instance with premium customer authentication.
 * @async
 */
const createPremiumCustomerApiAuth = async ( baseURL ) => {

  const { customer, credentials } = await createAuthenticatedCustomer(
    USER_ROLES.CUSTOMER.PREMIUM
  );

  return {
    customer,
    customerCredentials: credentials,
    apiCustomerAxios: createCustomerApiAuth( baseURL, credentials.id ),
  };

};

/**
 * Create a new axios authenticated instance with a given customer token.
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise<Object>} Return an axios authenticated instance based on
 * a given Authorization token.
 */
const createCustomerApiAuth = ( baseURL, accessToken ) => {

  const axiosOptions = {
    baseURL: baseURL,
    headers: {
      'content-type': 'application/json',
      'Authorization': accessToken,
    },
  };

  return axios.create( axiosOptions );

};

/**
 * Generates an unauthenticated axios instance.
 *
 * @param {String} baseURL - The base url in which the axios instance will be connected.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Object} Return an unauthenticated axios instance.
 */
const createApiUnauth = ( baseURL ) => {

  const axiosOptions = {
    baseURL: baseURL,
    headers: {
      'content-type': 'application/json',
    },
  };

  return axios.create( axiosOptions );

};

if ( process.env.NODE_ENV === 'test' ) {

  module.exports = {
    createAuthenticatedAdmin,
    createAuthenticatedCustomer,
    createAdminApiAuth,
    createApiUnauth,
    createRegularCustomerApiAuth,
    createPremiumCustomerApiAuth,
  };

}
