const express = require("express");
const {
  verify_token,
  require_admin_or_pm
} = require("../middlewares/auth_middleware");

const {
  create_project,
  get_all_projects,
  get_project_by_id
} = require("../controllers/project_controller");

const project_router = express.Router();

project_router.use(verify_token);
project_router.use(require_admin_or_pm);

project_router.post("/", create_project);
project_router.get("/", get_all_projects);
project_router.get("/:id", get_project_by_id);

module.exports = project_router;
