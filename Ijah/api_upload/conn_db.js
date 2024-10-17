const { parse } = require('path');
const { Pool } = require('pg');
require('dotenv').config();

/* change list : aamilham
1. make config into env variable
2. combine the pool and config into one function
3. change function to query database using async
4. change function to connect to database manually
5. add export query and connection */

// var config = {
//   user: 'pmon',
//   database: 'pmon',
//   password: 'pmon_132145',
//   host: '172.18.31.115',
//   port: 5432,
//   max: 10,
//   idleTimeoutMillis: 30000,
// };

const pool = new Pool ({
    user : process.env.DB_USER || 'ijah',
    host : process.env.DB_HOST || '127.0.0.1',
    database : process.env.DB_DATABASE || 'ijah',
    password : process.env.DB_PASSWORD || '123',
    port : process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    max : process.env.DB_MAX ? parseInt(process.env.DB_MAX, 10) : 10,
    idleTimeoutMillis : process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT, 10) : 30000,
});

pool.on('error', (err) => {
  console.error('idle client error', err.message, err.stack);
});

const query = async (text, params) => {
    try {
        console.log('Executing query:', text, params);
        const result = await pool.query(text, params);
        return result;
    } catch (err) {
        console.error('Query error:', err.message, err.stack);
        throw err;
    }
};

const connect = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to database');
        return client;
    } catch (err) {
        console.log('Error connecting to database:', err.message, err.stack);
        throw err;
    }
};

module.exports = {
    query,
    connect,
};