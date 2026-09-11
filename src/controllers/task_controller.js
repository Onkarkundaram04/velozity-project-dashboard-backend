const db = require("../config/db");

async function create_task(req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const project_id = req.body.project_id;
    const assigned_to_id = req.body.assigned_to_id;
    const priority = req.body.priority;
    const due_date = req.body.due_date;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required"
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    if (!due_date) {
      return res.status(400).json({
        success: false,
        message: "Due date is required"
      });
    }

    const project = await db.project.findUnique({
      where: {
        id: parseInt(project_id, 10)
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (req.user.role !== "ADMIN") {
      if (project.created_by_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You cannot add tasks to another Project Manager's project"
        });
      }
    }

    let task_priority = "MEDIUM";
    if (priority) {
      task_priority = priority;
    }

    let assigned_developer_id = null;
    if (assigned_to_id) {
      assigned_developer_id = parseInt(assigned_to_id, 10);
    }

    let task_description = null;
    if (description) {
      task_description = description;
    }

    const new_task = await db.task.create({
      data: {
        title: title,
        description: task_description,
        project_id: parseInt(project_id, 10),
        assigned_to_id: assigned_developer_id,
        priority: task_priority,
        due_date: new Date(due_date),
        status: "TODO"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: new_task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function get_all_tasks(req, res) {
  try {
    let where_clause = {};

    if (req.user.role === "DEVELOPER") {
      where_clause.assigned_to_id = req.user.id;
    } else if (req.user.role === "PROJECT_MANAGER") {
      where_clause.project = {
        created_by_id: req.user.id
      };
    }

    const status_filter = req.query.status;
    if (status_filter) {
      where_clause.status = status_filter;
    }

    const priority_filter = req.query.priority;
    if (priority_filter) {
      where_clause.priority = priority_filter;
    }

    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    if (from_date && to_date) {
      where_clause.due_date = {
        gte: new Date(from_date),
        lte: new Date(to_date)
      };
    } else if (from_date) {
      where_clause.due_date = {
        gte: new Date(from_date)
      };
    } else if (to_date) {
      where_clause.due_date = {
        lte: new Date(to_date)
      };
    }

    const tasks = await db.task.findMany({
      where: where_clause,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            client_name: true
          }
        },
        assigned_to: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          priority: "desc"
        },
        {
          due_date: "asc"
        }
      ]
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks: tasks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function update_task_status(req, res) {
  try {
    const task_id = parseInt(req.params.id, 10);
    const new_status = req.body.status;

    if (isNaN(task_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (!new_status) {
      return res.status(400).json({
        success: false,
        message: "New status is required"
      });
    }

    const task = await db.task.findUnique({
      where: {
        id: task_id
      },
      include: {
        project: true
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (req.user.role === "DEVELOPER") {
      if (task.assigned_to_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update tasks assigned to you"
        });
      }
    } else if (req.user.role === "PROJECT_MANAGER") {
      if (task.project.created_by_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update tasks in your own projects"
        });
      }
    }

    const old_status = task.status;

    const updated_task = await db.task.update({
      where: {
        id: task_id
      },
      data: {
        status: new_status
      }
    });

    const action_text = req.user.name + " moved Task #" + task.id + " from " + old_status + " -> " + new_status;

    const activity_record = await db.activityLog.create({
      data: {
        task_id: task.id,
        user_id: req.user.id,
        action_text: action_text
      }
    });

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task: updated_task,
      activity: activity_record
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  create_task,
  get_all_tasks,
  update_task_status
};
