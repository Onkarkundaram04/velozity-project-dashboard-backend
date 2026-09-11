const db = require("../config/db");

async function create_project(req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const client_name = req.body.client_name;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required"
      });
    }

    if (!client_name) {
      return res.status(400).json({
        success: false,
        message: "Client name is required"
      });
    }

    let project_description = null;
    if (description) {
      project_description = description;
    }

    const new_project = await db.project.create({
      data: {
        title: title,
        description: project_description,
        client_name: client_name,
        created_by_id: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: new_project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function get_all_projects(req, res) {
  try {
    let projects = [];

    if (req.user.role === "ADMIN") {
      projects = await db.project.findMany({
        include: {
          tasks: true,
          created_by: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } else {
      projects = await db.project.findMany({
        where: {
          created_by_id: req.user.id
        },
        include: {
          tasks: true,
          created_by: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects: projects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function get_project_by_id(req, res) {
  try {
    const project_id = parseInt(req.params.id, 10);

    if (isNaN(project_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const project = await db.project.findUnique({
      where: {
        id: project_id
      },
      include: {
        tasks: true,
        created_by: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
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
          message: "Forbidden: You cannot view another Project Manager's project"
        });
      }
    }

    return res.status(200).json({
      success: true,
      project: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  create_project,
  get_all_projects,
  get_project_by_id
};
