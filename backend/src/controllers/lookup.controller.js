const db = require("../db");

// GET /api/departments
async function listDepartments(req, res, next) {
  try {
    const result = await db.query(
      "SELECT id, dept_name FROM departments ORDER BY dept_name ASC",
    );
    res.json({ departments: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/routes
async function listRoutes(req, res, next) {
  try {
    const result = await db.query(
      "SELECT id, route_name, bus_number, capacity FROM bus_routes ORDER BY route_name ASC",
    );
    res.json({ routes: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDepartments, listRoutes };
