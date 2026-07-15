const express = require('express');
const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  removeStudent,
} = require('../controllers/student.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth); // single role: every student route requires a logged-in user

router.get('/', listStudents);            // list / search / filter
router.get('/:id', getStudent);           // student status: route, dept, fee status
router.post('/', createStudent);          // add student
router.put('/:id', updateStudent);        // full update
router.patch('/:id/status', updateStudentStatus); // update student status
router.delete('/:id', removeStudent);     // remove student

module.exports = router;
