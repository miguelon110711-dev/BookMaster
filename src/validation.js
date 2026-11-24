// trim() elimina espacios al inicio y al final; la expresión regular
// compacta espacios repetidos sin quitar tildes ni la letra ñ.
export function cleanText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : value;
}

export function validateId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function validateAuthor(body = {}) {
  const nombre = cleanText(body.nombre);
  const apellido = cleanText(body.apellido);
  const nacionalidad = cleanText(body.nacionalidad);
  const errors = [];

  // Validación 1: campos obligatorios.
  if (!nombre || !apellido || !nacionalidad) {
    errors.push('Nombre, apellido y nacionalidad son obligatorios.');
  }
  // Validación 2: longitudes y caracteres de texto. Se permiten letras Unicode,
  // tildes, ñ, espacios, puntos y guiones.
  const personName = /^[\p{L}][\p{L} .'-]*$/u;
  if (nombre && (nombre.length < 2 || nombre.length > 80 || !personName.test(nombre))) {
    errors.push('El nombre debe tener entre 2 y 80 caracteres y contener texto válido.');
  }
  if (apellido && (apellido.length < 2 || apellido.length > 100 || !personName.test(apellido))) {
    errors.push('El apellido debe tener entre 2 y 100 caracteres y contener texto válido.');
  }
  if (nacionalidad && (nacionalidad.length > 80 || !personName.test(nacionalidad))) {
    errors.push('La nacionalidad debe tener máximo 80 caracteres y contener texto válido.');
  }
  return { errors, data: { nombre, apellido, nacionalidad } };
}

export function validateBook(body = {}) {
  const titulo = cleanText(body.titulo);
  const isbn = cleanText(body.isbn);
  const anio = Number(body.anio_publicacion);
  const autor_id = Number(body.autor_id);
  const errors = [];

  // Validación 1: campos obligatorios.
  if (!titulo || !isbn || body.anio_publicacion === undefined || body.anio_publicacion === null || body.anio_publicacion === '') {
    errors.push('Título, ISBN y año de publicación son obligatorios.');
  }
  // Validación 2: longitud del título e ISBN (10 o 13 dígitos, con guiones opcionales).
  if (titulo && (titulo.length < 2 || titulo.length > 180)) {
    errors.push('El título debe tener entre 2 y 180 caracteres.');
  }
  const isbnCompact = typeof isbn === 'string' ? isbn.replace(/-/g, '') : '';
  if (isbn && !/^(?:[0-9]{9}[0-9Xx]|[0-9]{13})$/u.test(isbnCompact)) {
    errors.push('El ISBN debe tener 10 o 13 caracteres válidos (se permiten guiones).');
  }
  // Validación 3: año e identificación del autor.
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(anio) || anio < 1000 || anio > currentYear) {
    errors.push(`El año debe estar entre 1000 y ${currentYear}.`);
  }
  if (!Number.isInteger(autor_id) || autor_id < 1) {
    errors.push('Debe seleccionar un autor válido.');
  }

  return { errors, data: { titulo, isbn, anio_publicacion: anio, autor_id } };
}
