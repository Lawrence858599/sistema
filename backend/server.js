const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500";
const ALLOWED_STATUSES = ["Pendente", "Em Andamento", "Concluido"];

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
// O limite maior permite enviar imagens em base64 a partir do frontend sem multipart.
app.use(express.json({ limit: "15mb" }));

function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    description: row.description,
    location: row.location,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByName: row.created_by_name,
    imageCount: Number(row.image_count || 0),
  };
}

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha sao obrigatorios." });
    }

    const result = await db.query(
      "SELECT id, name, email FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    const user = result.rows[0];

    res.json({
      message: "Login realizado com sucesso.",
      token: `session-${user.id}-${Date.now()}`,
      user,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/tasks", async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT mt.id, mt.title, mt.client_name, mt.client_phone, mt.client_email,
              mt.description, mt.status, mt.location, mt.created_at, mt.updated_at,
              u.name AS created_by_name,
              COUNT(ti.id) AS image_count
       FROM maintenance_tasks mt
       LEFT JOIN users u ON u.id = mt.created_by
       LEFT JOIN task_images ti ON ti.task_id = mt.id
       GROUP BY mt.id, u.name
       ORDER BY mt.created_at DESC`
    );

    res.json(result.rows.map(mapTaskRow));
  } catch (error) {
    next(error);
  }
});

app.get("/tasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskResult = await db.query(
      `SELECT mt.id, mt.title, mt.client_name, mt.client_phone, mt.client_email,
              mt.description, mt.status, mt.location, mt.created_at, mt.updated_at,
              u.name AS created_by_name
       FROM maintenance_tasks mt
       LEFT JOIN users u ON u.id = mt.created_by
       WHERE mt.id = $1`,
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Tarefa nao encontrada." });
    }

    const imagesResult = await db.query(
      `SELECT id, file_name, mime_type, size_bytes, image_data, created_at
       FROM task_images
       WHERE task_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...mapTaskRow(taskResult.rows[0]),
      images: imagesResult.rows.map((image) => ({
        id: image.id,
        fileName: image.file_name,
        mimeType: image.mime_type,
        sizeBytes: image.size_bytes,
        imageData: image.image_data,
        createdAt: image.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/tasks", async (req, res, next) => {
  const client = await db.connect();

  try {
    const {
      title,
      clientName,
      clientPhone,
      clientEmail,
      description,
      location,
      createdBy,
      images = [],
    } = req.body;

    if (!title || !clientName || !clientPhone || !clientEmail || !description || !location || !createdBy) {
      return res.status(400).json({
        message:
          "title, clientName, clientPhone, clientEmail, description, location e createdBy sao obrigatorios.",
      });
    }

    if (!Array.isArray(images)) {
      return res.status(400).json({ message: "images deve ser um array." });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO maintenance_tasks (
         title, client_name, client_phone, client_email, description, location, status, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, clientName, clientPhone, clientEmail, description, location, "Pendente", createdBy]
    );

    const task = result.rows[0];

    for (const image of images) {
      if (!image.fileName || !image.mimeType || !image.sizeBytes || !image.imageData) {
        throw new Error("Cada imagem deve conter fileName, mimeType, sizeBytes e imageData.");
      }

      await client.query(
        `INSERT INTO task_images (task_id, file_name, mime_type, size_bytes, image_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [task.id, image.fileName, image.mimeType, image.sizeBytes, image.imageData]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(task);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

app.put("/tasks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    if (!status && !description) {
      return res.status(400).json({
        message: "Envie ao menos status ou description para atualizar.",
      });
    }

    const currentTask = await db.query("SELECT * FROM maintenance_tasks WHERE id = $1", [id]);

    if (currentTask.rows.length === 0) {
      return res.status(404).json({ message: "Tarefa nao encontrada." });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status informado e invalido." });
    }

    const task = currentTask.rows[0];
    const nextStatus = status || task.status;
    const nextDescription = description || task.description;

    const result = await db.query(
      `UPDATE maintenance_tasks
       SET status = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [nextStatus, nextDescription, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("[maintenance-api]", error);
  res.status(500).json({ message: "Erro interno do servidor." });
});

app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
