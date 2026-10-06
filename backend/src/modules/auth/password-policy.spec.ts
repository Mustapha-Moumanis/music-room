import { normalizeEmail, validatePasswordPolicy } from './password-policy';

describe('password policy', () => {
  it('normalizes email by trimming and lowercasing', () => {
    expect(normalizeEmail('  Hajar@Example.COM ')).toBe('hajar@example.com');
  });

  it('requires length, a letter, a digit, and not matching the email', () => {
    expect(validatePasswordPolicy('musicRoom42', 'hajar@example.com')).toBe(true);
    expect(validatePasswordPolicy('short1', 'hajar@example.com')).toBe(false);
    expect(validatePasswordPolicy('lettersOnlyPassword', 'hajar@example.com')).toBe(false);
    expect(validatePasswordPolicy('1234567890', 'hajar@example.com')).toBe(false);
    expect(validatePasswordPolicy('hajar@example.com', 'hajar@example.com')).toBe(false);
    expect(validatePasswordPolicy('x'.repeat(129) + '1', 'hajar@example.com')).toBe(false);
  });
});

