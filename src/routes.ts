import { Router } from 'express';
import GeneralController from '@controllers/GeneralController';
import ResponsibleController from '@controllers/ResponsibleController';
import DependentController from '@controllers/DependentController';

import authMiddleware from '@middlewares/AuthMiddleware';

const routes = Router();

const generalController = new GeneralController();
const responsibleController = new ResponsibleController();
const dependentController = new DependentController();

routes.get('/', generalController.start);

routes.post('/responsible/register', responsibleController.register);
routes.post('/responsible/register/confirm', responsibleController.confirmRegister);
routes.post('/responsible/login', responsibleController.login);
routes.post('/responsible/forgot-password', responsibleController.forgotPassword);
routes.post('/responsible/forgot-password/confirm', responsibleController.confirmForgotPassword);
routes.post('/responsible/generate-register-token', responsibleController.generateRegisterToken);
routes.get('/responsible/get', authMiddleware, responsibleController.get);
routes.put('/responsible/edit', authMiddleware, responsibleController.edit);
routes.put('/responsible/edit-password', authMiddleware, responsibleController.editPassword);
routes.delete('/responsible/delete/:cpf', authMiddleware, responsibleController.delete);
routes.get('/responsible/add-dependent', authMiddleware, responsibleController.generateAddToken);
routes.delete('/responsible/remove-dependent', authMiddleware, responsibleController.removeDependent);
routes.get('/responsible/contacts', authMiddleware, responsibleController.contacts);
routes.post('/responsible/get-contact', authMiddleware, responsibleController.getContact);

routes.post('/dependent/register', dependentController.register);
routes.post('/dependent/register/confirm', dependentController.confirmRegister);
routes.post('/dependent/login', dependentController.login);
routes.post('/dependent/forgot-password', dependentController.forgotPassword);
routes.post('/dependent/forgot-password/confirm', dependentController.confirmForgotPassword);
routes.post('/dependent/generate-register-token', dependentController.generateRegisterToken);
routes.get('/dependent/get', authMiddleware, dependentController.get);
routes.put('/dependent/edit', authMiddleware, dependentController.edit);
routes.put('/dependent/edit-password', authMiddleware, dependentController.editPassword);
routes.delete('/dependent/delete/:cpf', authMiddleware, dependentController.delete);
routes.post('/dependent/add-responsible', authMiddleware, dependentController.readAddToken);
routes.post('/dependent/add-responsible/confirm', authMiddleware, dependentController.confirmAddResponsible);
routes.delete('/dependent/remove-responsible', authMiddleware, dependentController.removeResponsible);
routes.get('/dependent/contacts', authMiddleware, dependentController.contacts);
routes.post('/dependent/get-contact', authMiddleware, dependentController.getContact);

export default routes;
