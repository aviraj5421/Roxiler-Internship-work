const fs = require('fs');
const path = require('path');
// dotenv is loaded inside db.js with the correct absolute path before the Pool is created.
// No need to call dotenv.config() here — doing so after db.js is already imported was the
// original bug: the Pool was constructed with undefined env vars.
const { pool, query } = require('../config/db');

async function initDb() {
  console.log('--- Initializing PostgreSQL Database Schema ---');
  try {
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Connecting to database...');
    // Test connection
    await query('SELECT NOW()');
    console.log('Database connected successfully.');

    console.log('Executing schema.sql...');
    await query(schemaSql);

    console.log('Database tables, constraints, and indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
