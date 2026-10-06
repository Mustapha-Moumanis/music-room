export const passwordPolicyMessage = 'Use 10-128 chars with at least one letter and one digit.';

export function validPassword(password: string): boolean {
  return password.length >= 10 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
