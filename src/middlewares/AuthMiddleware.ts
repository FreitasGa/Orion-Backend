import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import IJwt from '@interfaces/JwtInterface';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).send({ error: 'Requisição não contem jwt' });
  }

  const token = authorization.replace('Bearer', '').trim();

  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id } = data as IJwt;

    req.userId = id;
    return next();
  } catch {
    res.status(400).send({ error: 'Token invalido' });
  }
}

export default authMiddleware;
