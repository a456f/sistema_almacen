-- =====================================================================
-- Sistema de Control de Inventario de Cajas
-- Esquema de base de datos
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sistema_inventario
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_inventario;

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(120),
  rol VARCHAR(20) DEFAULT 'admin',
  estado TINYINT DEFAULT 1,
  ultimo_login DATETIME NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorías de cajas (Red Fibra Óptica, UTP, Energía, etc.)
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) UNIQUE NOT NULL,
  color VARCHAR(20) DEFAULT '#2563eb'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cajas del inventario
CREATE TABLE IF NOT EXISTS cajas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_caja VARCHAR(60) NOT NULL,
  cantidad INT DEFAULT 0,
  marca VARCHAR(200),
  modelo VARCHAR(200),
  descripcion TEXT,
  tipo VARCHAR(300),
  uso TEXT,
  caracteristicas TEXT,
  categoria_id INT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  imagen VARCHAR(255) NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_numero (numero_caja),
  INDEX idx_categoria (categoria_id),
  CONSTRAINT fk_caja_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  numero_serie VARCHAR(120) NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_caja (caja_id),
  INDEX idx_sn (numero_serie),
  INDEX idx_estado (estado),
  CONSTRAINT fk_prod_caja FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS producto_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_producto (producto_id),
  CONSTRAINT fk_imgprod FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
