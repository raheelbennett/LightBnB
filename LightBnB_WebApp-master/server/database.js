const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool.query(`
  SELECT * 
  FROM users
  WHERE users.email = $1 
  `, [email])
    .then(user => {
      if (!user.rowCount) {
        return null;
      } else {
        return user.rows[0];
      }
    })
    .catch(err => err.message);
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool.query(`
  SELECT * 
  FROM users
  WHERE users.id = $1 
  `, [id])
    .then(user => {
      if (!user.rowCount) {
        return null;
      } else {
        return user.rows[0];
      }
    })
    .catch(err => err.message);
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 * RETURNING * at the end of the insert query returns the entry if successful
 */
const addUser = function (user) {
  return pool.query(`
  INSERT INTO users (
    name, email, password) 
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [user.name, user.email, user.password])
    .then(entry => entry.rows[0])
    .catch(err => err.message);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool.query(`
  SELECT reservations.*, title, cost_per_night, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, title, cost_per_night
  ORDER BY start_date
  LIMIT $2;
  `, [guest_id, limit])
    .then(result => result.rows)
    .catch(err => err.message);

}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  return pool.query(`
  SELECT *
  FROM properties
  LIMIT $1;
  `, [limit])
    .then((result) => result.rows)
    .catch((err) => err.message);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
