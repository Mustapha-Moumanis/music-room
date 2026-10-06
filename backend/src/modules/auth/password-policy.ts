export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePasswordPolicy(password: string, email: string): boolean {
  if (password.length < 10 || password.length > 128) return false;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return false;
  return password !== normalizeEmail(email);
}

