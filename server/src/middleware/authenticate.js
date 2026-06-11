import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../utils/prisma.js';
import { UnauthorizedError } from '../utils/errors.js';

export default async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, active: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.active) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
