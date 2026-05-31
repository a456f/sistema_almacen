-- Migración 004: catálogos de marcas, modelos y tipos
USE sistema_inventario;

CREATE TABLE IF NOT EXISTS marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) UNIQUE NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS modelos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) UNIQUE NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(250) UNIQUE NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pre-poblamos con los valores que ya existían en productos para no perder historial
INSERT IGNORE INTO marcas (nombre)
  SELECT DISTINCT TRIM(marca) FROM productos WHERE marca IS NOT NULL AND TRIM(marca) <> '';

INSERT IGNORE INTO modelos (nombre)
  SELECT DISTINCT TRIM(modelo) FROM productos WHERE modelo IS NOT NULL AND TRIM(modelo) <> '';

INSERT IGNORE INTO tipos (nombre)
  SELECT DISTINCT TRIM(tipo) FROM productos WHERE tipo IS NOT NULL AND TRIM(tipo) <> '';
