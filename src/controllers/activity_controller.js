const db = require("../config/db");

async function get_recent_activities(req, res) {
  try {
    let where_clause = {};

    if (req.user.role === "DEVELOPER") {
      where_clause.task = {
        assigned_to_id: req.user.id
      };
    } else if (req.user.role === "PROJECT_MANAGER") {
      where_clause.task = {
        project: {
          created_by_id: req.user.id
        }
      };
    }

    const logs = await db.activityLog.findMany({
      where: where_clause,
      take: 20,
      orderBy: {
        created_at: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      activities: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  get_recent_activities
};
