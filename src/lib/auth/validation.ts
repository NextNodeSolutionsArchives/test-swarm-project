export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (typeof username !== "string" || username.length === 0) {
    errors.push("Username is required");
    return { valid: false, errors };
  }

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
  }

  if (username.length > 30) {
    errors.push("Username must be at most 30 characters");
  }

  if (!USERNAME_REGEX.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (typeof email !== "string" || email.length === 0) {
    errors.push("Email is required");
    return { valid: false, errors };
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push("Invalid email format");
  }

  return { valid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (typeof password !== "string" || password.length === 0) {
    errors.push("Password is required");
    return { valid: false, errors };
  }

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!SPECIAL_CHARS.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
}

export function validateRegisterInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Request body is required"] };
  }

  const body = input as Record<string, unknown>;

  const usernameResult = validateUsername(body.username as string);
  const emailResult = validateEmail(body.email as string);
  const passwordResult = validatePassword(body.password as string);

  errors.push(...usernameResult.errors, ...emailResult.errors, ...passwordResult.errors);

  return { valid: errors.length === 0, errors };
}

export function validateLoginInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Request body is required"] };
  }

  const body = input as Record<string, unknown>;

  if (typeof body.email !== "string" || body.email.length === 0) {
    errors.push("Email is required");
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required");
  }

  return { valid: errors.length === 0, errors };
}
