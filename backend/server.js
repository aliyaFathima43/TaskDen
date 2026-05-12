const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function ensureSchema() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      status BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  await pool.query(createUsersTable);
  await pool.query(createTasksTable);

  // Migration for older installs that had no user_id.
  try {
    await pool.query("ALTER TABLE tasks ADD COLUMN user_id INT NULL");
  } catch (err) {
    // Column may already exist.
  }
  
  try {
    await pool.query("ALTER TABLE tasks ADD INDEX idx_tasks_user_id (user_id)");
  } catch (err) {
    // Index may already exist.
  }
  
  try {
    await pool.query(
      "ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
    );
  } catch (err) {
    // Constraint may already exist.
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/auth/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword
    ]);

    const token = jwt.sign({ userId: result.insertId, username }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user: { id: result.insertId, username } });
  } catch (error) {
    console.error("POST /auth/register error:", error);
    return res.status(500).json({ message: "Could not register user" });
  }
});

app.post("/auth/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const [rows] = await pool.query("SELECT id, username, password FROM users WHERE username = ?", [username]);
    if (!rows.length) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("POST /auth/login error:", error);
    return res.status(500).json({ message: "Could not login" });
  }
});

app.get("/tasks", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, title, status, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC, id DESC",
      [req.user.userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("GET /tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

app.post("/tasks", authenticate, async (req, res) => {
  const { title, status } = req.body;
  const normalizedTitle = String(title || "").trim();

  if (!normalizedTitle) {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    const [result] = await pool.query("INSERT INTO tasks (user_id, title, status) VALUES (?, ?, ?)", [
      req.user.userId,
      normalizedTitle,
      Boolean(status)
    ]);

    const [rows] = await pool.query(
      "SELECT id, user_id, title, status, created_at FROM tasks WHERE id = ? AND user_id = ?",
      [result.insertId, req.user.userId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /tasks error:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
});

app.put("/tasks/:id", authenticate, async (req, res) => {
  const taskId = Number(req.params.id);
  const { title, status } = req.body;

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const updates = [];
  const values = [];

  if (title !== undefined) {
    const normalizedTitle = String(title || "").trim();
    if (!normalizedTitle) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }
    updates.push("title = ?");
    values.push(normalizedTitle);
  }

  if (status !== undefined) {
    updates.push("status = ?");
    values.push(Boolean(status));
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  try {
    values.push(taskId);
    values.push(req.user.userId);
    const [result] = await pool.query(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const [rows] = await pool.query(
      "SELECT id, user_id, title, status, created_at FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, req.user.userId]
    );

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("PUT /tasks/:id error:", error);
    return res.status(500).json({ message: "Failed to update task" });
  }
});

app.delete("/tasks/:id", authenticate, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  try {
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, req.user.userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE /tasks/:id error:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
});

async function startServer() {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();
