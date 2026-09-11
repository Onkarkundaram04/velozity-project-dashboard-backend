function error_handler(err, req, res, next) {
  let status_code = 500;
  if (err.status_code) {
    status_code = err.status_code;
  }

  let error_message = "Internal server error";
  if (err.message) {
    error_message = err.message;
  }

  return res.status(status_code).json({
    success: false,
    message: error_message
  });
}

module.exports = {
  error_handler
};
