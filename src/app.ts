import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';

import connect from '@database/index';
import routes from './routes';

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

connect();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(routes);

export { io, http };
