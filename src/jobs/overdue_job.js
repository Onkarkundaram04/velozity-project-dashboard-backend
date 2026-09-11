const cron = require("node-cron");
const db = require("../config/db");

function start_overdue_job() {
  // Runs every 5 minutes
  cron.schedule("*/5 * * * *", async function () {
    try {
      const current_time = new Date();

      const result = await db.task.updateMany({
        where: {
          due_date: {
            lt: current_time
          },
          status: {
            notIn: ["DONE", "OVERDUE"]
          }
        },
        data: {
          status: "OVERDUE"
        }
      });

      if (result.count > 0) {
        console.log("Flagged " + result.count + " overdue tasks.");
      }
    } catch (error) {
      console.error("Error in overdue task job:", error.message);
    }
  });
}

module.exports = {
  start_overdue_job
};
