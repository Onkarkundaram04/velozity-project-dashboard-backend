const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

async function seed_database() {
  try {
    console.log("Starting database seeding...");

    // 1. Clear existing data in correct relational order
    await db.activityLog.deleteMany({});
    await db.task.deleteMany({});
    await db.project.deleteMany({});
    await db.user.deleteMany({});

    // 2. Hash default password
    const hashed_password = await bcrypt.hash("password123", 10);

    // 3. Create 1 Admin, 2 Project Managers, 4 Developers
    const admin = await db.user.create({
      data: {
        name: "Alice Admin",
        email: "admin@example.com",
        password: hashed_password,
        role: "ADMIN"
      }
    });

    const pm_one = await db.user.create({
      data: {
        name: "Peter Manager",
        email: "pm1@example.com",
        password: hashed_password,
        role: "PROJECT_MANAGER"
      }
    });

    const pm_two = await db.user.create({
      data: {
        name: "Paula Manager",
        email: "pm2@example.com",
        password: hashed_password,
        role: "PROJECT_MANAGER"
      }
    });

    const dev_one = await db.user.create({
      data: {
        name: "Devon Dave",
        email: "dev1@example.com",
        password: hashed_password,
        role: "DEVELOPER"
      }
    });

    const dev_two = await db.user.create({
      data: {
        name: "Diana Developer",
        email: "dev2@example.com",
        password: hashed_password,
        role: "DEVELOPER"
      }
    });

    const dev_three = await db.user.create({
      data: {
        name: "Daniel Dev",
        email: "dev3@example.com",
        password: hashed_password,
        role: "DEVELOPER"
      }
    });

    const dev_four = await db.user.create({
      data: {
        name: "Daisy Coder",
        email: "dev4@example.com",
        password: hashed_password,
        role: "DEVELOPER"
      }
    });

    console.log("Users created: 1 Admin, 2 PMs, 4 Developers.");

    // 4. Create 3 Projects (assigned to PMs)
    const project_one = await db.project.create({
      data: {
        title: "E-Commerce Mobile Application",
        description: "Next-generation mobile retail store",
        client_name: "Acme Retailers",
        created_by_id: pm_one.id
      }
    });

    const project_two = await db.project.create({
      data: {
        title: "Enterprise CRM Migration",
        description: "Cloud migration of legacy CRM database",
        client_name: "Nexus Global",
        created_by_id: pm_one.id
      }
    });

    const project_three = await db.project.create({
      data: {
        title: "CarePlus Patient Portal",
        description: "HIPAA-compliant healthcare portal",
        client_name: "CarePlus Hospitals",
        created_by_id: pm_two.id
      }
    });

    console.log("Projects created: 3 projects.");

    // 5. Create 5+ Tasks for Project 1 (Includes 1 Overdue Task)
    const task_1 = await db.task.create({
      data: {
        title: "Design PostgreSQL Schema",
        description: "Create relational tables with indexes",
        status: "DONE",
        priority: "CRITICAL",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        project_id: project_one.id,
        assigned_to_id: dev_one.id
      }
    });

    const task_2 = await db.task.create({
      data: {
        title: "Implement JWT Authentication",
        description: "Access tokens and HttpOnly refresh cookies",
        status: "IN_REVIEW",
        priority: "HIGH",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        project_id: project_one.id,
        assigned_to_id: dev_one.id
      }
    });

    const task_3 = await db.task.create({
      data: {
        title: "Integrate Payment Gateway",
        description: "Setup Stripe checkout endpoints",
        status: "IN_PROGRESS",
        priority: "HIGH",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        project_id: project_one.id,
        assigned_to_id: dev_two.id
      }
    });

    const task_4 = await db.task.create({
      data: {
        title: "Build Shopping Cart Service",
        description: "Cart item management and calculations",
        status: "TODO",
        priority: "MEDIUM",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        project_id: project_one.id,
        assigned_to_id: dev_two.id
      }
    });

    const task_5 = await db.task.create({
      data: {
        title: "Setup CI/CD Deployment Pipeline",
        description: "Automated testing on merge",
        status: "OVERDUE",
        priority: "CRITICAL",
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past due
        project_id: project_one.id,
        assigned_to_id: dev_one.id
      }
    });

    // 6. Create 5+ Tasks for Project 2 (Includes 1 Overdue Task)
    const task_6 = await db.task.create({
      data: {
        title: "Audit Legacy Data Structures",
        description: "Identify deprecated database fields",
        status: "DONE",
        priority: "MEDIUM",
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        project_id: project_two.id,
        assigned_to_id: dev_three.id
      }
    });

    const task_7 = await db.task.create({
      data: {
        title: "Write Migration ETL Scripts",
        description: "Transform customer records for PostgreSQL",
        status: "IN_PROGRESS",
        priority: "HIGH",
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        project_id: project_two.id,
        assigned_to_id: dev_three.id
      }
    });

    const task_8 = await db.task.create({
      data: {
        title: "Customer Contact Sync API",
        description: "Bidirectional sync endpoint",
        status: "TODO",
        priority: "LOW",
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        project_id: project_two.id,
        assigned_to_id: dev_four.id
      }
    });

    const task_9 = await db.task.create({
      data: {
        title: "Database Security Pen Test",
        description: "Ensure role permissions block leakage",
        status: "OVERDUE",
        priority: "CRITICAL",
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Past due
        project_id: project_two.id,
        assigned_to_id: dev_three.id
      }
    });

    const task_10 = await db.task.create({
      data: {
        title: "Load Test Database Indexes",
        description: "Simulate high concurrency reads",
        status: "TODO",
        priority: "MEDIUM",
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        project_id: project_two.id,
        assigned_to_id: dev_four.id
      }
    });

    // 7. Create 5+ Tasks for Project 3
    const task_11 = await db.task.create({
      data: {
        title: "Setup HIPAA Audit Logging",
        description: "Log all patient access events",
        status: "DONE",
        priority: "CRITICAL",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        project_id: project_three.id,
        assigned_to_id: dev_four.id
      }
    });

    const task_12 = await db.task.create({
      data: {
        title: "Patient Registration Endpoint",
        description: "Validate medical record numbers",
        status: "IN_REVIEW",
        priority: "HIGH",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        project_id: project_three.id,
        assigned_to_id: dev_four.id
      }
    });

    const task_13 = await db.task.create({
      data: {
        title: "Doctor Appointment Scheduler",
        description: "Slot booking and conflict prevention",
        status: "IN_PROGRESS",
        priority: "HIGH",
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        project_id: project_three.id,
        assigned_to_id: dev_one.id
      }
    });

    const task_14 = await db.task.create({
      data: {
        title: "Lab Results Download Service",
        description: "Signed URL generation for patient reports",
        status: "TODO",
        priority: "MEDIUM",
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        project_id: project_three.id,
        assigned_to_id: dev_two.id
      }
    });

    const task_15 = await db.task.create({
      data: {
        title: "SMS Appointment Reminders",
        description: "Twilio webhook triggers",
        status: "TODO",
        priority: "LOW",
        due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        project_id: project_three.id,
        assigned_to_id: dev_three.id
      }
    });

    console.log("Tasks created: 15 tasks (including 2 in OVERDUE status).");

    // 8. Create pre-existing activity log entries
    await db.activityLog.createMany({
      data: [
        {
          task_id: task_1.id,
          user_id: dev_one.id,
          action_text: "Devon Dave moved Task #" + task_1.id + " from IN_PROGRESS -> DONE"
        },
        {
          task_id: task_2.id,
          user_id: dev_one.id,
          action_text: "Devon Dave moved Task #" + task_2.id + " from IN_PROGRESS -> IN_REVIEW"
        },
        {
          task_id: task_3.id,
          user_id: dev_two.id,
          action_text: "Diana Developer moved Task #" + task_3.id + " from TODO -> IN_PROGRESS"
        },
        {
          task_id: task_6.id,
          user_id: dev_three.id,
          action_text: "Daniel Dev moved Task #" + task_6.id + " from IN_PROGRESS -> DONE"
        },
        {
          task_id: task_11.id,
          user_id: dev_four.id,
          action_text: "Daisy Coder moved Task #" + task_11.id + " from IN_REVIEW -> DONE"
        }
      ]
    });

    console.log("Activity logs created: 5 entries.");
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  } finally {
    await db.$disconnect();
  }
}

seed_database();
