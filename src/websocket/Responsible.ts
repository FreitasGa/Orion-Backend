import ResponsibleService from '@services/ResponsibleService';
import DependentService from '@services/DependentService';
import { io } from '../app';

const responsibleNsp = io.of('/responsible');

responsibleNsp.on('connection', (socket) => {
  const socketId = socket.id;

  const responsibleService = new ResponsibleService();
  const dependentService = new DependentService();

  console.log(`Responsible connected on ${socketId}`);

  socket.on('send-location', async (response) => {
    console.log(response);
  });

  socket.on('disconnect', () => {
    console.log('Responsible disconnected');
  });
});
