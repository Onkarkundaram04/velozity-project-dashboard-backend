const express = require("express");
const {
  verify_token,
  require_admin_or_pm
} = require("../middlewares/auth_middleware");

const {
  create_task,
  get_all_tasks,
  update_task_status
} = require("../controllers/task_controller");

const task_router = express.Router();

task_router.use(verify_token);

task_router.post("/", require_admin_or_pm, create_task);
task_router.get("/", get_all_tasks);
task_router.patch("/:id/status", update_task_status);

module.exports = task_router;
