const { Pool } = require('pg');

// pg reads PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE from process.env automatically,
// but we pass them explicitly for clarity.
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
