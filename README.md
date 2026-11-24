# BookMaster API

API REST para administrar autores y libros de una biblioteca. El proyecto utiliza **Node.js + Express** y **MySQL**. No requiere frontend: se prueba mediante cURL, Postman o cualquier cliente HTTP.

## 1. Relación entre modelos (1:N)

- **authors (autores):** entidad principal.
- **books (libros):** entidad relacionada.
- Un autor puede tener muchos libros y cada libro pertenece a un solo autor (`books.autor_id`).

## 2. Tecnologías y requisitos

- Node.js 18 o superior.
- MySQL mediante XAMPP (o MySQL Server).
- npm.
- Git (para publicar en GitHub).

## 3. Estructura del proyecto

```text
BookMaster_API/
├── database/
│   └── schema.sql
├── src/
│   ├── routes/
│   │   ├── authors.js
│   │   └── books.js
│   ├── db.js
│   ├── server.js
│   └── validation.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 4. Crear la base de datos

1. Abre XAMPP e inicia **MySQL**.
2. Entra a `http://localhost/phpmyadmin`.
3. Selecciona **Importar** y carga `database/schema.sql`.
4. El script crea la base `bookmaster` y las tablas `authors` y `books`.
5. La base usa `utf8mb4_unicode_ci`, compatible con tildes y ñ.

## 5. Configurar y ejecutar la API

Abre una terminal dentro de la carpeta `BookMaster_API` y ejecuta:

```bash
npm install
```

Crea un archivo `.env` copiando el contenido de `.env.example`. En Windows PowerShell puedes ejecutar:

```powershell
Copy-Item .env.example .env
```

Si tu MySQL usa otra contraseña, edita `DB_PASSWORD` en `.env`.

Inicia el servidor:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

Comprueba la conexión:

```bash
curl.exe http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "BookMaster API y base de datos conectadas."
}
```

> En Windows PowerShell se recomienda escribir `curl.exe` para invocar cURL y no el alias `curl`.

## 6. Validaciones implementadas

1. **Campos obligatorios:** los datos requeridos no pueden llegar vacíos.
2. **Longitudes y formato:** se validan longitudes de nombres y títulos; el ISBN debe tener 10 o 13 caracteres válidos.
3. **Año de publicación e identificadores:** el año debe ser un entero entre 1000 y el año actual, y los IDs deben ser enteros positivos.

Además:
- Se aplica `trim()` y se compactan espacios repetidos.
- Se aceptan letras Unicode, incluidas tildes y ñ.
- MySQL utiliza `utf8mb4`.
- El ISBN es único en la base de datos.
- No se permite eliminar un autor que todavía tenga libros asociados.
- Se verifica que el autor exista antes de registrar o actualizar un libro.

## 7. Paginación

Los listados aceptan los parámetros `page` y `limit`:

```text
GET /api/authors?page=1&limit=10
GET /api/books?page=1&limit=10
```

`page` indica la página solicitada y `limit` la cantidad de registros (máximo 50). La respuesta incluye `data` y `pagination` con página, límite, total y totalPages.

## 8. Tabla resumen de endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica API y conexión MySQL |
| GET | `/api/authors?page=1&limit=10` | Lista autores paginados |
| GET | `/api/authors/:id` | Consulta un autor |
| POST | `/api/authors` | Crea un autor |
| PUT | `/api/authors/:id` | Actualiza un autor |
| DELETE | `/api/authors/:id` | Elimina un autor sin libros asociados |
| POST | `/api/authors/:id/books` | **Crea un libro asociado al autor (endpoint 1:N)** |
| GET | `/api/books?page=1&limit=10` | Lista libros paginados |
| GET | `/api/books/:id` | Consulta un libro |
| POST | `/api/books` | Crea un libro indicando `autor_id` |
| PUT | `/api/books/:id` | Actualiza un libro |
| DELETE | `/api/books/:id` | Elimina un libro |

## 9. Pruebas con cURL

Los ejemplos usan `localhost:3000`. Ejecuta el servidor antes de probarlos.

### 9.1 Crear un autor

```bash
curl.exe -X POST http://localhost:3000/api/authors -H "Content-Type: application/json" -d '{"nombre":"Gabriel","apellido":"García Márquez","nacionalidad":"Colombiana"}'
```

### 9.2 Listar autores con paginación

```bash
curl.exe "http://localhost:3000/api/authors?page=1&limit=5"
```

### 9.3 Consultar un autor por ID

```bash
curl.exe http://localhost:3000/api/authors/1
```

### 9.4 Actualizar un autor

```bash
curl.exe -X PUT http://localhost:3000/api/authors/1 -H "Content-Type: application/json" -d '{"nombre":"Gabriel","apellido":"García Márquez","nacionalidad":"Colombiana"}'
```

### 9.5 Crear un libro mediante el endpoint 1:N

Este es el endpoint especial solicitado en clase. El ID del autor va en la URL; no es necesario enviar `autor_id` en el JSON.

```bash
curl.exe -X POST http://localhost:3000/api/authors/1/books -H "Content-Type: application/json" -d '{"titulo":"Cien años de soledad","isbn":"9780307474728","anio_publicacion":1967}'
```

### 9.6 Listar libros con paginación

```bash
curl.exe "http://localhost:3000/api/books?page=1&limit=5"
```

### 9.7 Consultar un libro

```bash
curl.exe http://localhost:3000/api/books/1
```

### 9.8 Crear un libro usando el CRUD general

```bash
curl.exe -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"titulo":"La vorágine","isbn":"9789583001234","anio_publicacion":1924,"autor_id":1}'
```

### 9.9 Actualizar un libro

```bash
curl.exe -X PUT http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"titulo":"Cien años de soledad - Edición especial","isbn":"9780307474728","anio_publicacion":1967,"autor_id":1}'
```

### 9.10 Eliminar un libro

```bash
curl.exe -X DELETE http://localhost:3000/api/books/1
```

### 9.11 Eliminar un autor

Solo es posible si el autor no tiene libros asociados.

```bash
curl.exe -X DELETE http://localhost:3000/api/authors/1
```

## 10. Respuestas y códigos HTTP principales

| Código | Significado |
|---|---|
| 200 | Consulta, actualización o eliminación exitosa |
| 201 | Registro creado |
| 400 | Datos o parámetros inválidos |
| 404 | Registro o ruta no encontrados |
| 409 | ISBN duplicado o autor con libros asociados |
| 500 | Error interno del servidor |

## 11. Publicar en GitHub

1. Crea en GitHub un repositorio **público** llamado `BookMaster`.
2. Abre una terminal en la carpeta raíz `BookMaster_API`.
3. Ejecuta estos comandos para crear al menos tres commits con cambios organizados:

```bash
git init
git add package.json .gitignore .env.example database/
git commit -m "chore: crear estructura y esquema de base de datos"

git add src/db.js src/validation.js src/routes/
git commit -m "feat: implementar API REST y operaciones CRUD"

git add src/server.js README.md
git commit -m "docs: documentar endpoints, paginacion y pruebas curl"

git branch -M main
git remote add origin https://github.com/TU-USUARIO/BookMaster.git
git push -u origin main
```

Reemplaza `TU-USUARIO` por tu usuario real de GitHub. No subas el archivo `.env` ni la carpeta `node_modules`.

## 12. Nota sobre el alcance

Esta entrega es una **API REST**, por lo que no incluye interfaz gráfica React. Las operaciones se realizan mediante endpoints HTTP y las respuestas se entregan en JSON.
