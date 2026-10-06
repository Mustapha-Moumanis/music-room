import { normalizeEmail, validatePasswordPolicy } from './password-policy';

describe('password policy', () => {
  it('normalizes email by trimming and lowercasing', () => {
    expect(normalizeEmail('  john@Example.COM ')).toBe('john@example.com');
  });

  it('requires length, a letter, a digit, and not matching the email', () => {
    expect(validatePasswordPolicy('musicRoom42', 'john@example.com')).toBe(true);
    expect(validatePasswordPolicy('short1', 'john@example.com')).toBe(false);
    expect(validatePasswordPolicy('lettersOnlyPassword', 'john@example.com')).toBe(false);
    expect(validatePasswordPolicy('1234567890', 'john@example.com')).toBe(false);
    expect(validatePasswordPolicy('john@example.com', 'john@example.com')).toBe(false);
    expect(validatePasswordPolicy('x'.repeat(129) + '1', 'john@example.com')).toBe(false);
  });
});

