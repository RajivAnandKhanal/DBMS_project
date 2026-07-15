// Centralized error handler. Any `next(err)` call ends up here.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Postgres unique_violation (e.g. duplicate roll_no)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A student with this roll number already exists' });
  }

  // Postgres invalid enum value (e.g. bad fee_status)
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid value supplied for one of the fields' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
