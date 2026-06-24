import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validateEgyptPhone,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validateTime,
  validatePositiveNumber,
  sanitize,
} from '../utils/validation.js';

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    assert.equal(validateEmail('test@example.com'), null);
    assert.equal(validateEmail('user.name+tag@domain.co.uk'), null);
  });

  it('returns error for invalid email', () => {
    assert.ok(validateEmail(''));
    assert.ok(validateEmail('not-an-email'));
    assert.ok(validateEmail('@domain.com'));
    assert.ok(validateEmail(123));
  });

  it('returns error for missing input', () => {
    assert.ok(validateEmail(null));
    assert.ok(validateEmail(undefined));
  });
});

describe('validateEgyptPhone', () => {
  it('returns null for valid Egyptian phone numbers', () => {
    assert.equal(validateEgyptPhone('01000000000'), null);
    assert.equal(validateEgyptPhone('01100000000'), null);
    assert.equal(validateEgyptPhone('01200000000'), null);
    assert.equal(validateEgyptPhone('01500000000'), null);
    assert.equal(validateEgyptPhone('+201000000000'), null);
  });

  it('returns error for invalid phone numbers', () => {
    assert.ok(validateEgyptPhone(''));
    assert.ok(validateEgyptPhone('02000000000'));
    assert.ok(validateEgyptPhone('12345'));
    assert.ok(validateEgyptPhone('0100000000'));
  });
});

describe('validatePassword', () => {
  it('returns null for passwords >= 8 chars', () => {
    assert.equal(validatePassword('12345678'), null);
    assert.equal(validatePassword('a'.repeat(20)), null);
  });

  it('returns error for short passwords', () => {
    assert.ok(validatePassword('1234567'));
    assert.ok(validatePassword(''));
    assert.ok(validatePassword(null));
  });
});

describe('validatePasswordConfirmation', () => {
  it('returns null when passwords match', () => {
    assert.equal(validatePasswordConfirmation('abc123', 'abc123'), null);
  });

  it('returns error when passwords do not match', () => {
    assert.ok(validatePasswordConfirmation('abc123', 'xyz789'));
  });
});

describe('validateName', () => {
  it('returns null for valid names', () => {
    assert.equal(validateName('Ahmed'), null);
    assert.equal(validateName('Ahmed Hassan'), null);
  });

  it('returns error for short names', () => {
    assert.ok(validateName('A'));
    assert.ok(validateName(''));
    assert.ok(validateName(null));
  });
});

describe('validateTime', () => {
  it('returns null for valid times', () => {
    assert.equal(validateTime('09:00'), null);
    assert.equal(validateTime('23:59'), null);
  });

  it('returns error for invalid times', () => {
    assert.ok(validateTime('24:00'));
    assert.ok(validateTime('9:00'));
    assert.ok(validateTime(null));
  });
});

describe('validatePositiveNumber', () => {
  it('returns null for positive numbers', () => {
    assert.equal(validatePositiveNumber(100), null);
    assert.equal(validatePositiveNumber('50'), null);
  });

  it('returns error for invalid values', () => {
    assert.ok(validatePositiveNumber(0));
    assert.ok(validatePositiveNumber(-1));
    assert.ok(validatePositiveNumber('abc'));
    assert.ok(validatePositiveNumber(null));
  });
});

describe('sanitize', () => {
  it('strips HTML tags', () => {
    assert.equal(sanitize('<script>alert(1)</script>'), 'scriptalert(1)/script');
    assert.equal(sanitize('Hello <b>World</b>'), 'Hello bWorld/b');
  });

  it('trims whitespace', () => {
    assert.equal(sanitize('  hello  '), 'hello');
  });

  it('returns empty string for non-strings', () => {
    assert.equal(sanitize(null), '');
    assert.equal(sanitize(undefined), '');
    assert.equal(sanitize(123), '');
  });
});
