import crypto from 'crypto';

export default function requestId(req, _res, next) {
  req.id = crypto.randomUUID();
  next();
}
