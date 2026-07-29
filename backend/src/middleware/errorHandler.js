const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { JsonWebTokenError } = require('jsonwebtoken');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ error: 'Database error' });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
