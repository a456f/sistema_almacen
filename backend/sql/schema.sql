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
  numero_serie VARCHAR(100) NULL,
  cantidad INT DEFAULT 0,
  marca VARCHAR(200),
  modelo VARCHAR(200),
  descripcion TEXT,
  tipo VARCHAR(300),
  uso TEXT,
  caracteristicas TEXT,
  categoria_id INT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_numero (numero_caja),
  INDEX idx_serie (numero_serie),
  INDEX idx_categoria (categoria_id),
  CONSTRAINT fk_caja_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
