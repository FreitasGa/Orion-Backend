import ResponsibleService from '@services/ResponsibleService';
import DependentService from '@services/DependentService';
import { io } from '../app';

const dependentNsp = io.of('/dependent');

dependentNsp.on('connection', (socket) => {
  const socketId = socket.id;

  const dependentService = new DependentService();
  const responsibleService = new ResponsibleService();

  console.log(`Dependent connected on ${socketId}`);

  socket.on('send-location', async (response) => {
    console.log(response);
  });

  socket.on('disconnect', () => {
    console.log('Dependent disconnected');
  });
});
