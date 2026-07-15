const db = require("../db");

const FEE_STATUSES = ["paid", "unpaid", "pending"];

// GET /api/students?search=&department=&bus_route=&fee_status=
async function listStudents(req, res, next) {
  try {
    const { search, department, bus_route, fee_status } = req.query;
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR roll_no ILIKE $${values.length})`,
      );
    }
    if (department) {
      values.push(department);
      conditions.push(`department = $${values.length}`);
    }
    if (bus_route) {
      values.push(bus_route);
      conditions.push(`bus_route = $${values.length}`);
    }
    if (fee_status) {
      values.push(fee_status);
      conditions.push(`fee_status = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db.query(
      `SELECT id, name, roll_no, department, bus_route, fee_status, phone, address, created_at, updated_at
       FROM students ${where} ORDER BY id DESC`,
      values,
    );

    res.json({ students: result.rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/:id  -> "student status": route, department, fee status, etc.
async function getStudent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM students WHERE id = $1", [id]);

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
    const { name, roll_no, department, bus_route, fee_status, phone, address } =
      req.body;

    if (!name || !roll_no || !department || !bus_route) {
      return res.status(400).json({
        error: "name, roll_no, department and bus_route are required",
      });
    }

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `INSERT INTO students (name, roll_no, department, bus_route, fee_status, phone, address)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'unpaid'), $6, $7)
       RETURNING *`,
      [
        name,
        roll_no,
        department,
        bus_route,
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

// PUT /api/students/:id  (full update)
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { name, roll_no, department, bus_route, fee_status, phone, address } =
      req.body;

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `UPDATE students SET
         name = COALESCE($1, name),
         roll_no = COALESCE($2, roll_no),
         department = COALESCE($3, department),
         bus_route = COALESCE($4, bus_route),
         fee_status = COALESCE($5, fee_status),
         phone = COALESCE($6, phone),
         address = COALESCE($7, address)
       WHERE id = $8
       RETURNING *`,
      [name, roll_no, department, bus_route, fee_status, phone, address, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/students/:id/status  (quick status update: route / department / fee status)
async function updateStudentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { department, bus_route, fee_status } = req.body;

    if (!department && !bus_route && !fee_status) {
      return res.status(400).json({
        error: "Provide at least one of: department, bus_route, fee_status",
      });
    }

    if (fee_status && !FEE_STATUSES.includes(fee_status)) {
      return res.status(400).json({
        error: `fee_status must be one of: ${FEE_STATUSES.join(", ")}`,
      });
    }

    const result = await db.query(
      `UPDATE students SET
         department = COALESCE($1, department),
         bus_route = COALESCE($2, bus_route),
         fee_status = COALESCE($3, fee_status)
       WHERE id = $4
       RETURNING *`,
      [department, bus_route, fee_status, id],
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
