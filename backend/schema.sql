CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS client_name VARCHAR(150);
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS client_phone VARCHAR(40);
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS client_email VARCHAR(150);

UPDATE maintenance_tasks
SET client_name = COALESCE(client_name, 'Cliente nao informado'),
    client_phone = COALESCE(client_phone, 'Nao informado'),
    client_email = COALESCE(client_email, 'nao-informado@local')
WHERE client_name IS NULL OR client_phone IS NULL OR client_email IS NULL;

ALTER TABLE maintenance_tasks ALTER COLUMN client_name SET NOT NULL;
ALTER TABLE maintenance_tasks ALTER COLUMN client_phone SET NOT NULL;
ALTER TABLE maintenance_tasks ALTER COLUMN client_email SET NOT NULL;

CREATE TABLE IF NOT EXISTS task_images (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    size_bytes INTEGER NOT NULL,
    image_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password)
VALUES ('Administrador', 'admin@sistema.com', '123456')
ON CONFLICT (email) DO NOTHING;
