const db = require("../db");

const FEE_STATUSES = ["paid", "unpaid", "pending"];

// GET /api/students?search=&department_id=&route_id=&fee_status=
async function listStudents(req, res, next) {
  try {
    const { search, department_id, route_id, fee_status } = req.query;
    const conditions = [];
    const values = [];

    // Base query using the recommendation: JOIN with departments and bus_routes
    let queryText = `
      SELECT 
        s.id, s.name, s.roll_no, s.fee_status, s.phone, s.address, s.created_at,
        d.dept_name, 
        r.route_name, 
        r.bus_number 
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN bus_routes r ON s.route_id = r.id
    `;

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(s.name ILIKE $${values.length} OR s.roll_no ILIKE $${values.length})`,
      );
    }
    if (department_id) {
      values.push(department_id);
      conditions.push(`s.department_id = $${values.length}`);
    }
    if (route_id) {
      values.push(route_id);
      conditions.push(`s.route_id = $${values.length}`);
    }
    if (fee_status) {
      values.push(fee_status);
      conditions.push(`s.fee_status = $${values.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryText += ` ORDER BY s.id DESC`;

    const result = await db.query(queryText, values);
    res.json({ students: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/:id
async function getStudent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT s.*, d.dept_name, r.route_name, r.bus_number 
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN bus_routes r ON s.route_id = r.id
       WHERE s.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/students
async function createStudent(req, res, next) {
  try {
    const {
      name,
      roll_no,
      department_id,
      route_id,
      fee_status,
      phone,
      address,
    } = req.body;

    // Updated validation for IDs
    if (!name || !roll_no || !department_id || !route_id) {
      return res.status(400).json({
        error: "name, roll_no, department_id and route_id are required",
      });
    }

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `INSERT INTO students (name, roll_no, department_id, route_id, fee_status, phone, address)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'unpaid'), $6, $7)
       RETURNING *`,
      [
        name,
        roll_no,
        department_id,
        route_id,
        fee_status,
        phone || null,
        address || null,
      ],
    );

    res.status(201).json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/:id
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      roll_no,
      department_id,
      route_id,
      fee_status,
      phone,
      address,
    } = req.body;

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `UPDATE students SET
         name = COALESCE($1, name),
         roll_no = COALESCE($2, roll_no),
         department_id = COALESCE($3, department_id),
         route_id = COALESCE($4, route_id),
         fee_status = COALESCE($5, fee_status),
         phone = COALESCE($6, phone),
         address = COALESCE($7, address)
       WHERE id = $8
       RETURNING *`,
      [name, roll_no, department_id, route_id, fee_status, phone, address, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/students/:id/status
async function updateStudentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { department_id, route_id, fee_status } = req.body;

    if (!department_id && !route_id && !fee_status) {
      return res.status(400).json({
        error: "Provide at least one of: department_id, route_id, fee_status",
      });
    }

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `UPDATE students SET
         department_id = COALESCE($1, department_id),
         route_id = COALESCE($2, route_id),
         fee_status = COALESCE($3, fee_status)
       WHERE id = $4
       RETURNING *`,
      [department_id, route_id, fee_status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/students/:id
async function removeStudent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM students WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student removed", id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  removeStudent,
};
