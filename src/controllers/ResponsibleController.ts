import { Request, Response } from 'express';
import crypto from 'crypto';

import ResponsibleService from '@services/ResponsibleService';
import DependentService from '@services/DependentService';
import TokenServices from '@services/TokenService';
import DurableTokenService from '@services/DurableTokenService';
import MailService from '@services/MailService';

class ResponsibleController {
  public async register(req: Request, res: Response): Promise<Response> {
    const { email, cpf, phoneNumber } = req.body;

    const responsibleService = new ResponsibleService();
    const dependentService = new DependentService();
    const durableTokenService = new DurableTokenService();

    try {
      if (await responsibleService.verify2(email, cpf, phoneNumber)) {
        return res.status(400).send({ error: 'Credenciais ja cadastradas' });
      }

      if (await dependentService.verify2(email, cpf, phoneNumber)) {
        return res.status(400).send({ error: 'Credenciais ja cadastradas' });
      }

      const responsible = await responsibleService.create(req.body);
      const token = await durableTokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'reRegister',
        belong: responsible.id,
      });
      await MailService.send(token.secret, email, 'confirmEmail', `${token.secret} é o seu codigo de confirmação`);

      return res.status(200).send({ responsible, token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no cadastro' });
    }
  }

  public async confirmRegister(req: Request, res: Response): Promise<Response> {
    const { email, secret } = req.body;

    const responsibleService = new ResponsibleService();
    const durableTokenService = new DurableTokenService();

    try {
      const responsible = await responsibleService.getByEmail(email);
      const token = await durableTokenService.get(secret, 'reRegister');

      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }
      if (responsible.id !== token.belong) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await responsibleService.setActive(token.belong);
      await durableTokenService.delete(token.id);

      return res.status(200).send({ message: 'Email verificado' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro na verificação' });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const responsibleService = new ResponsibleService();

    try {
      const responsible = await responsibleService.getByEmailWithPassword(email);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await responsibleService.comparePassword(password, responsible.password)) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!responsible.active) {
        return res.status(400).send({ error: 'Email não confirmado' });
      }

      responsible.password = undefined;

      const jwt = await responsibleService.generateJwt({ id: responsible.id });

      return res.status(200).send({ responsible, jwt });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no login' });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const responsibleService = new ResponsibleService();
    const tokenService = new TokenServices();

    try {
      if (!await responsibleService.verify(email)) {
        return res.status(400).send({ error: 'Email não cadastrado' });
      }

      const responsible = await responsibleService.getByEmail(email);
      const token = await tokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'reForgotPassword',
        belong: responsible._id,
      });
      await MailService.send(token.secret, email, 'forgotPassword', `${token.secret} é o seu codigo de recuperação de senha`);

      return res.status(200).send({ responsible, token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro' });
    }
  }

  public async confirmForgotPassword(req: Request, res: Response): Promise<Response> {
    const { email, secret, password } = req.body;

    const responsibleService = new ResponsibleService();
    const tokenService = new TokenServices();

    try {
      if (!await responsibleService.verify(email)) {
        return res.status(400).send({ error: 'Email não cadastrado' });
      }

      const token = await tokenService.get(secret, 'reForgotPassword');

      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }

      await responsibleService.changePassword(email, password);
      await tokenService.delete(token.id);

      return res.status(200).send({ message: 'Senha alterada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro ao mudar senha' });
    }
  }

  public async generateRegisterToken(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const responsibleService = new ResponsibleService();
    const tokenService = new TokenServices();

    try {
      const responsible = await responsibleService.getByEmail(email);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const token = await tokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'reRegister',
        belong: responsible.id,
      });
      await MailService.send(token.secret, email, 'confirmEmail', `${token.secret} é o seu codigo de confirmação`);

      return res.status(200).send({ token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro ao criar token' });
    }
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { userId } = req;

    const responsibleService = new ResponsibleService();

    try {
      const responsible = await responsibleService.getById(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      return res.status(200).send({ responsible });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async edit(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const {
      name, email, country, phoneNumber, password,
    } = req.body;

    const responsibleService = new ResponsibleService();

    try {
      const responsible = await responsibleService.getByIdWithPassword(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await responsibleService.comparePassword(password, responsible.password)) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const newResponsible = await responsibleService.edit(
        userId, name, email, country, phoneNumber,
      );

      return res.status(200).send({ newResponsible });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async editPassword(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { email, oldPassword, newPassword } = req.body;

    const responsibleService = new ResponsibleService();

    try {
      const responsible = await responsibleService.getByIdWithPassword(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (responsible.email !== email) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await responsibleService.comparePassword(oldPassword, responsible.password)) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await responsibleService.changePassword(email, newPassword);

      return res.status(200).send({ message: 'Senha alterada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { cpf } = req.params;

    const responsibleService = new ResponsibleService();

    try {
      const responsible = await responsibleService.getById(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (responsible.cpf !== cpf) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await responsibleService.delete(userId);

      return res.status(200).send({ message: 'Conta encerrada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async generateAddToken(req: Request, res: Response): Promise<Response> {
    const { userId } = req;

    const responsibleService = new ResponsibleService();
    const tokenService = new TokenServices();

    try {
      const responsible = await responsibleService.getById(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const token = await tokenService.create({
        secret: crypto.randomBytes(3).toString('hex').toUpperCase(),
        method: 'reAdd',
        belong: responsible.id,
      });

      return res.status(200).send({ token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async removeDependent(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { id } = req.body;

    const responsibleService = new ResponsibleService();
    const dependentService = new DependentService();

    try {
      const responsible = await responsibleService.getById(userId);
      const dependent = await dependentService.getById(id);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await responsibleService.verifyForDependent(responsible.id, id)) {
        return res.status(400).send({ error: 'Responsável não adicionado' });
      };

      await responsibleService.removeDependent(userId, dependent.id);
      await dependentService.removeResponsible(id, responsible.id);

      return res.status(200).send({ message: 'Dependente removido' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async contacts(req: Request, res: Response): Promise<Response> {
    const { userId } = req;

    const responsibleService = new ResponsibleService();
    const dependentService = new DependentService();

    try {
      const responsible = await responsibleService.getById(userId);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const list = await dependentService.getContacts(responsible.dependents);

      return res.status(200).send({ list });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async getContact(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { id } = req.body;

    const responsibleService = new ResponsibleService();
    const dependentService = new DependentService();

    try {
      const responsible = await responsibleService.getById(userId);
      const contact = await dependentService.getById(id);

      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!contact) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      return res.status(200).send({ contact });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }
}

export default ResponsibleController;
