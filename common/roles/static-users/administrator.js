'use strict';
// const uuid = require( 'uuid/v4' );
const CONSTANT_ROLES = require( '../../../shared/constants-roles' );

module.exports = {
  model: 'Administrator',
  roleName: CONSTANT_ROLES.ADMIN,
  rolDescription: 'Administrator',
  users: [{
    id: process.env.ADMINITRATOR_ID,
    name: process.env.ADMINITRATOR_NAME,
    lastName: process.env.ADMINITRATOR_LAST_NAME, // eslint-disable-line camelcase
    type: CONSTANT_ROLES.ADMIN,
    username: process.env.ADMINITRATOR_USERNAME,
    email: process.env.ADMINITRATOR_EMAIL,
    password: process.env.ADMINITRATOR_PASSWORD,
  }],
};
