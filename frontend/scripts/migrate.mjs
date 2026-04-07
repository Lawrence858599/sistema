import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContent = fs.readFileSync(envPath, "utf8");
  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const [key, ...valueParts] = line.split("=");
    if (!key || valueParts.length === 0 || process.env[key]) {
      continue;
    }

    const value = valueParts.join("=").replace(/^"|"$/g, "");
    process.env[key] = value;
  }
}

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("A migration local suporta apenas DATABASE_URL em formato file:.");
  }

  return path.resolve(process.cwd(), databaseUrl.slice("file:".length));
}

loadDotEnv();

const databasePath = resolveDatabasePath();
const migrationsDirectory = path.resolve(process.cwd(), "prisma", "migrations");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON;");
database.exec(`
  CREATE TABLE IF NOT EXISTS _app_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const appliedMigrationNames = new Set(
  database
    .prepare("SELECT name FROM _app_migrations ORDER BY id ASC")
    .all()
    .map((row) => row.name),
);

const migrationEntries = fs
  .readdirSync(migrationsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name));

for (const migrationEntry of migrationEntries) {
  if (appliedMigrationNames.has(migrationEntry.name)) {
    continue;
  }

  const migrationPath = path.join(
    migrationsDirectory,
    migrationEntry.name,
    "migration.sql",
  );

  const sql = fs.readFileSync(migrationPath, "utf8");
  database.exec("BEGIN;");
  try {
    database.exec(sql);
    database
      .prepare("INSERT INTO _app_migrations (name) VALUES (?)")
      .run(migrationEntry.name);
    database.exec("COMMIT;");
    console.log(`Applied migration: ${migrationEntry.name}`);
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

console.log(`Database ready at ${databasePath}`);