const express = require("express");
const {
  login_user,
  refresh_access_token,
  logout_user
} = require("../controllers/auth_controller");

const auth_router = express.Router();

auth_router.post("/login", login_user);
auth_router.post("/refresh", refresh_access_token);
auth_router.post("/logout", logout_user);

module.exports = auth_router;
