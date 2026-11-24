const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { pool, query } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Verify PostgreSQL Database Connection
    console.log('Testing PostgreSQL database connection...');
    const dbTest = await query('SELECT NOW() AS current_time, current_database() AS db_name');
    console.log(
      `PostgreSQL Database connected successfully! [DB: ${dbTest.rows[0].db_name}] at ${dbTest.rows[0].current_time}`
    );
  } catch (dbError) {
    console.error('WARNING: PostgreSQL connection failed on startup:');
    console.error(`- Message: ${dbError.message}`);
    console.error('The server will still start, but database operations will fail until Postgres is running and configured.');
    console.error('Please verify your .env database settings (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).');
  }

  // 2. Start HTTP Express Server
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Roxiler Store Rating Platform Backend`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Server URL  : http://localhost:${PORT}`);
    console.log(` API Base    : http://localhost:${PORT}/api`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // 3. Graceful Shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Closing HTTP server and PostgreSQL pool...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('PostgreSQL connection pool closed.');
      } catch (err) {
        console.error('Error closing PostgreSQL pool:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

startServer();
