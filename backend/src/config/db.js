const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load .env from backend/ root using an absolute path derived from this file's location.
// This guarantees the correct .env is loaded regardless of which script imports db.js
// and regardless of process.cwd() at the time of import.
// __dirname = backend/src/config/  →  ../../.env = backend/.env
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL || isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'store_rating_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: useSSL || (isProduction && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST))
        ? { rejectUnauthorized: false }
        : false,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // Connected client to PostgreSQL pool
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

/**
 * Execute parameterized SQL query
 * @param {string} text - SQL Query with parameter placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_SQL === 'true') {
      console.log('[SQL Query]', { text, params, duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('[SQL Execution Error]', { text, params, message: error.message });
    throw error;
  }
};

/**
 * Get a dedicated client from the pool (for transactions)
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  pool,
  query,
  getClient,
};
