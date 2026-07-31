const express = require("express");
const { listDepartments, listRoutes } = require("../controllers/lookup.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/departments", listDepartments);
router.get("/routes", listRoutes);

module.exports = router;
