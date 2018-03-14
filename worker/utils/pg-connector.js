
'use strict';

const pg = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'dblogin',
  database: 'arm_db',
  password: 'dblogin',
  max: 100, // max number of clients in the pool
  idleTimeoutMillis: 10000, // milliseconds
};

const pool = new pg.Pool(config);

module.exports = pool;



