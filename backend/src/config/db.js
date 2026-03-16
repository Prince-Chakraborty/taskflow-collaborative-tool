const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'collaborative_tool_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Query helper
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
