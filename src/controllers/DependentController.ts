import { Request, Response } from 'express';
import crypto from 'crypto';

import ResponsibleService from '@services/ResponsibleService';
import DependentService from '@services/DependentService';
import TokenServices from '@services/TokenService';
import DurableTokenService from '@services/DurableTokenService';
import MailService from '@services/MailService';

class DependentController {
  public async register(req: Request, res: Response): Promise<Response> {
    const { email, cpf, phoneNumber } = req.body;

    const dependentService = new DependentService();
    const responsibleService = new ResponsibleService();
    const durableTokenService = new DurableTokenService();

    try {
      if (await dependentService.verify2(email, cpf, phoneNumber)) {
        return res.status(400).send({ error: 'Credenciais ja cadastradas' });
      }

      if (await responsibleService.verify2(email, cpf, phoneNumber)) {
        return res.status(400).send({ error: 'Credenciais ja cadastradas' });
      }

      const dependent = await dependentService.create(req.body);
      const token = await durableTokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'deRegister',
        belong: dependent.id,
      });
      await MailService.send(token.secret, email, 'confirmEmail', `${token.secret} é o seu codigo de confirmação`);

      return res.status(200).send({ dependent, token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no cadastro' });
    }
  }

  public async confirmRegister(req: Request, res: Response): Promise<Response> {
    const { email, secret } = req.body;

    const dependentService = new DependentService();
    const durableTokenService = new DurableTokenService();

    try {
      const dependent = await dependentService.getByEmail(email);
      const token = await durableTokenService.get(secret, 'deRegister');

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }
      if (dependent.id !== token.belong) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await dependentService.setActive(token.belong);
      await durableTokenService.delete(token.id);

      return res.status(200).send({ message: 'Email verificado' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro na verificação' });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const dependentService = new DependentService();

    try {
      const dependent = await dependentService.getByEmailWithPassword(email);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await dependentService.comparePassword(password, dependent.password)) {
        return res.status(400).send({ error: 'Credencias invalidas' });
      }

      if (!dependent.active) {
        return res.status(400).send({ error: 'Email não confirmado' });
      }

      dependent.password = undefined;

      const jwt = await dependentService.generateJwt({ id: dependent.id });

      return res.status(200).send({ dependent, jwt });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no login' });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const dependentService = new DependentService();
    const tokenService = new TokenServices();

    try {
      if (!await dependentService.verify(email)) {
        return res.status(400).send({ error: 'Email não cadastrado' });
      }

      const dependent = await dependentService.getByEmail(email);
      const token = await tokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'deForgotPassword',
        belong: dependent.id,
      });
      await MailService.send(token.secret, email, 'forgotPassword', `${token.secret} é o seu codigo de recuperação de senha`);

      return res.status(200).send({ dependent, token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro' });
    }
  }

  public async confirmForgotPassword(req: Request, res:Response): Promise<Response> {
    const { email, secret, password } = req.body;

    const dependentService = new DependentService();
    const tokenService = new TokenServices();

    try {
      if (!await dependentService.verify(email)) {
        return res.status(400).send({ error: 'Email não cadastrado' });
      }

      const token = await tokenService.get(secret, 'deForgotPassword');

      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }

      await dependentService.changePassword(email, password);
      await tokenService.delete(token.id);

      return res.status(200).send({ message: 'Senha alterada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro ao mudar a senha' });
    }
  }

  public async generateRegisterToken(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const dependentService = new DependentService();
    const tokenService = new TokenServices();

    try {
      const dependent = await dependentService.getByEmail(email);
      const token = await tokenService.create({
        secret: crypto.randomBytes(4).toString('hex').toUpperCase(),
        method: 'deRegister',
        belong: dependent.id,
      });
      await MailService.send(token.secret, email, 'confirmEmail', `${token.secret} é o seu codigo de confirmação`);

      return res.status(200).send({ token });
    } catch (error) {
      return res.status(400).send({ error: 'Erro ao criar token' });
    }
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { userId } = req;

    const dependentService = new DependentService();

    try {
      const dependent = await dependentService.getById(userId);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      return res.status(200).send({ dependent });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async edit(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const {
      name, email, country, phoneNumber, password,
    } = req.body;

    const dependentService = new DependentService();

    try {
      const dependent = await dependentService.getByIdWithPassword(userId);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await dependentService.comparePassword(password, dependent.password)) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const newDependent = await dependentService.edit(
        userId, name, email, country, phoneNumber,
      );

      return res.status(200).send({ newDependent });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async editPassword(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { email, oldPassword, newPassword } = req.body;

    const dependentService = new DependentService();

    try {
      const dependent = await dependentService.getByIdWithPassword(userId);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (dependent.email !== email) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await dependentService.comparePassword(oldPassword, dependent.password)) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await dependentService.changePassword(email, newPassword);

      return res.status(200).send({ message: 'Senha alterada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { cpf } = req.params;

    const dependentService = new DependentService();

    try {
      const dependent = await dependentService.getById(userId);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (dependent.cpf !== cpf) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      await dependentService.delete(userId);

      return res.status(200).send({ message: 'Conta encerrada' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async readAddToken(req: Request, res:Response): Promise<Response> {
    const { userId } = req;
    const { secret } = req.body;

    const dependentService = new DependentService();
    const tokenService = new TokenServices();
    const responsibleService = new ResponsibleService();

    try {
      const dependent = await dependentService.getById(userId);
      const token = await tokenService.get(secret, 'reAdd');
      const responsible = await responsibleService.getById(token.belong);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }
      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (await dependentService.verifyForResponsible(dependent.id, responsible.id)) {
        return res.status(400).send({ error: 'Responsável já adicionado' });
      };

      return res.status(200).send({ responsible });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async confirmAddResponsible(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { id, secret } = req.body;

    const dependentService = new DependentService();
    const responsibleService = new ResponsibleService();
    const tokenService = new TokenServices();

    try {
      const dependent = await dependentService.getById(userId);
      const responsible = await responsibleService.getById(id);
      const token = await tokenService.get(secret, 'reAdd');

      if (!token) {
        return res.status(400).send({ error: 'Codigo errado' });
      }
      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (await dependentService.verifyForResponsible(dependent.id, id)) {
        return res.status(400).send({ error: 'Responsável já adicionado' });
      };

      await dependentService.addResponsible(dependent.id, id);
      await responsibleService.addDependent(id, dependent.id);

      await tokenService.delete(token.id);

      return res.status(200).send({ message: 'Responsável adicionado' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async removeResponsible(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { id } = req.body;

    const dependentService = new DependentService();
    const responsibleService = new ResponsibleService();

    try {
      const dependent = await dependentService.getById(userId);
      const responsible = await responsibleService.getById(id);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }
      if (!responsible) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      if (!await dependentService.verifyForResponsible(dependent.id, id)) {
        return res.status(400).send({ error: 'Responsável não adicionado' });
      };

      await dependentService.removeResponsible(userId, responsible.id);
      await responsibleService.removeDependent(id, dependent.id);

      return res.status(200).send({ message: 'Responsável removido' });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async contacts(req: Request, res: Response): Promise<Response> {
    const { userId } = req;

    const dependentService = new DependentService();
    const responsibleService = new ResponsibleService();

    try {
      const dependent = await dependentService.getById(userId);

      if (!dependent) {
        return res.status(400).send({ error: 'Credenciais invalidas' });
      }

      const list = await responsibleService.getContacts(dependent.responsible);

      return res.status(200).send({ list });
    } catch (error) {
      return res.status(400).send({ error: 'Erro no processo' });
    }
  }

  public async getContact(req: Request, res: Response): Promise<Response> {
    const { userId } = req;
    const { id } = req.body;

    const dependentService = new DependentService();
    const responsibleService = new ResponsibleService();

    try {
      const dependent = await dependentService.getById(userId);
      const contact = await responsibleService.getById(id);

      if (!dependent) {
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

export default DependentController;
