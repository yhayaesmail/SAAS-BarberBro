import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors.js';

describe('AppError', () => {
  it('creates with default values', () => {
    const err = new AppError('test');
    assert.equal(err.message, 'test');
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, 'BAD_REQUEST');
    assert.equal(err.isOperational, true);
  });

  it('creates with custom values', () => {
    const err = new AppError('custom', 418, 'TEAPOT');
    assert.equal(err.message, 'custom');
    assert.equal(err.statusCode, 418);
    assert.equal(err.code, 'TEAPOT');
  });
});

describe('NotFoundError', () => {
  it('has correct defaults', () => {
    const err = new NotFoundError();
    assert.equal(err.message, 'Resource not found');
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, 'NOT_FOUND');
  });
});

describe('UnauthorizedError', () => {
  it('has correct defaults', () => {
    const err = new UnauthorizedError();
    assert.equal(err.message, 'Authentication required');
    assert.equal(err.statusCode, 401);
    assert.equal(err.code, 'UNAUTHORIZED');
  });
});

describe('ForbiddenError', () => {
  it('has correct defaults', () => {
    const err = new ForbiddenError();
    assert.equal(err.message, 'Insufficient permissions');
    assert.equal(err.statusCode, 403);
    assert.equal(err.code, 'FORBIDDEN');
  });
});

describe('ValidationError', () => {
  it('has correct defaults', () => {
    const err = new ValidationError();
    assert.equal(err.message, 'Validation failed');
    assert.equal(err.statusCode, 422);
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.deepEqual(err.details, []);
  });

  it('stores details', () => {
    const details = [{ field: 'email', message: 'Invalid' }];
    const err = new ValidationError('Bad input', details);
    assert.equal(err.details, details);
  });
});

describe('ConflictError', () => {
  it('has correct defaults', () => {
    const err = new ConflictError();
    assert.equal(err.message, 'Resource already exists');
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'CONFLICT');
  });
});

describe('Conflict detection logic', () => {
  function hasConflict(newStart, newEnd, existing) {
    return existing.some(
      (occ) => (newStart < occ.end && newEnd > occ.start)
    );
  }

  it('detects overlapping slots', () => {
    const existing = [
      { start: 540, end: 600 },
      { start: 660, end: 720 },
    ];
    assert.equal(hasConflict(530, 550, existing), true);
    assert.equal(hasConflict(600, 630, existing), false);
    assert.equal(hasConflict(590, 610, existing), true);
    assert.equal(hasConflict(700, 710, existing), true);
    assert.equal(hasConflict(720, 750, existing), false);
  });

  it('exact boundary is not a conflict', () => {
    const existing = [{ start: 540, end: 600 }];
    assert.equal(hasConflict(600, 630, existing), false);
    assert.equal(hasConflict(510, 540, existing), false);
  });

  it('completely contained slot conflicts', () => {
    const existing = [{ start: 540, end: 660 }];
    assert.equal(hasConflict(550, 560, existing), true);
    assert.equal(hasConflict(600, 650, existing), true);
  });

  it('wrapping slot conflicts', () => {
    const existing = [{ start: 600, end: 630 }];
    assert.equal(hasConflict(590, 640, existing), true);
  });
});
