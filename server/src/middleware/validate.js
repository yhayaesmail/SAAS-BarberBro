import { ValidationError } from '../utils/errors.js';

export default function validate(schema) {
  return (req, _res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      for (const rule of rules) {
        if (typeof rule === 'function') {
          const error = rule(value);
          if (error) {
            errors.push({ field, message: error });
            break;
          }
        }
      }
    }
    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }
    next();
  };
}
