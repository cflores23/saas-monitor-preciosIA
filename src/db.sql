CREATE DATABASE saas_prices_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE USER 'saas_user'@'localhost' IDENTIFIED BY 'kawys2375';

GRANT ALL PRIVILEGES ON saas_prices_db.* TO 'saas_user'@'localhost';
FLUSH PRIVILEGES;


USE saas_prices_db;

-- Tabla de usuarios de la app
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de productos o servicios a monitorear
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de precios históricos
CREATE TABLE IF NOT EXISTS prices (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


USE saas_prices_db;

-- Tabla de notificaciones de cambios de precio
CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Índice en prices para consultas por producto y fecha
CREATE INDEX idx_prices_product_id_recorded_at
ON prices (product_id, recorded_at);

-- Índice en notifications para consultas por usuario y producto
CREATE INDEX idx_notifications_user_product
ON notifications (user_id, product_id);

-- Índice en users por email (ya es UNIQUE, así que no es necesario)
-- CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Agregar índice a tabla prices
ALTER TABLE prices
ADD INDEX idx_prices_product_id_recorded_at (product_id, recorded_at);

-- Agregar índice a tabla notifications
ALTER TABLE notifications
ADD INDEX idx_notifications_user_product (user_id, product_id);

