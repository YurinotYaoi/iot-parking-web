export function validateRequiredFields(body, fields) {
  for (const field of fields) {
    if (!body[field]) return `Missing required field: ${field}`;
  }
  return null;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}