const jwt = require("jsonwebtoken");

function verify_token(req, res, next) {
  const auth_header = req.headers["authorization"];

  if (!auth_header) {
    return res.status(401).json({
      success: false,
      message: "Access token is required"
    });
  }

  const parts = auth_header.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({
      success: false,
      message: "Token format must be: Bearer <token>"
    });
  }

  const token_type = parts[0];
  const access_token = parts[1];

  if (token_type !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Token format must be: Bearer <token>"
    });
  }

  try {
    const decoded_user = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded_user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token"
    });
  }
}

function require_admin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated"
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required"
    });
  }

  return next();
}

function require_admin_or_pm(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated"
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "PROJECT_MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin or Project Manager access required"
    });
  }

  return next();
}

module.exports = {
  verify_token,
  require_admin,
  require_admin_or_pm
};
