CREATE DATABASE IF NOT EXISTS bookmaster
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bookmaster;

CREATE TABLE IF NOT EXISTS authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  nacionalidad VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  anio_publicacion SMALLINT UNSIGNED NOT NULL,
  autor_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_authors
    FOREIGN KEY (autor_id) REFERENCES authors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registro inicial opcional: Gabriel García Márquez.
INSERT INTO authors (nombre, apellido, nacionalidad)
SELECT 'Gabriel', 'García Márquez', 'Colombiana'
WHERE NOT EXISTS (
  SELECT 1 FROM authors WHERE nombre='Gabriel' AND apellido='García Márquez'
);
