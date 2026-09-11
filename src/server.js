require("dotenv").config();
const express = require("express");
const cookie_parser = require("cookie-parser");
const cors = require("cors");

const auth_router = require("./routes/auth_routes");
const project_router = require("./routes/project_routes");
const task_router = require("./routes/task_routes");
const activity_router = require("./routes/activity_routes");

const { error_handler } = require("./middlewares/error_middleware");
const { start_overdue_job } = require("./jobs/overdue_job");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookie_parser());

app.use("/api/auth", auth_router);
app.use("/api/projects", project_router);
app.use("/api/tasks", task_router);
app.use("/api/activities", activity_router);

app.use(error_handler);

let port_number = 5000;
if (process.env.PORT) {
  port_number = process.env.PORT;
}

app.listen(port_number, function () {
  console.log("Server is running on port " + port_number);
  start_overdue_job();
});
