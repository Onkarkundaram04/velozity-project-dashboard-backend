const express = require("express");
const { verify_token } = require("../middlewares/auth_middleware");
const { get_recent_activities } = require("../controllers/activity_controller");

const activity_router = express.Router();

activity_router.use(verify_token);

activity_router.get("/", get_recent_activities);

module.exports = activity_router;
