import { Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import IResponsible from '@interfaces/ResponsibleInterface';
import Responsible from '@models/Responsible';

class ResponsibleServices {
  private responsibleModel: Model<IResponsible>

  constructor() {
    this.responsibleModel = Responsible;
  }

  public async create(responsible: IResponsible) {
    const newResponsible = await this.responsibleModel.create(responsible);
    newResponsible.password = undefined;

    return newResponsible;
  }

  public async verify(param: string) {
    const responsibleExists = await this.responsibleModel.findOne({
      $or: [{ email: param }, { cpf: param }, { phoneNumber: param }],
    });

    if (responsibleExists) {
      return true;
    }

    return false;
  }

  public async verify2(email: string, cpf: string, phoneNumber: string) {
    const responsibleExists = await this.responsibleModel.findOne({
      $or: [{ email }, { cpf }, { phoneNumber }],
    });

    if (responsibleExists) {
      return true;
    }

    return false;
  }

  public async getByEmailWithPassword(email: string) {
    const responsible = await this.responsibleModel.findOne({ email }).select('+password');

    return responsible;
  }

  public async getByIdWithPassword(id: string) {
    const responsible = await this.responsibleModel.findById(id).select('+password');

    return responsible;
  }

  public async comparePassword(password: string, rePassword: string) {
    if (await bcrypt.compare(password, rePassword)) {
      return true;
    }

    return false;
  }

  public async changePassword(email: string, password: string) {
    const responsible = await this.getByEmailWithPassword(email);
    responsible.password = password;
    responsible.save();

    return responsible;
  }

  public async generateJwt(params: Record<string, unknown>) {
    const jsonToken = jwt.sign(params, process.env.TOKEN_SECRET, {
      expiresIn: 86400,
    });

    return jsonToken;
  }

  public async setActive(id: string) {
    const responsible = await this.responsibleModel.findById(id).updateOne({ active: true });

    return responsible;
  }

  public async getById(id: string) {
    const responsible = await this.responsibleModel.findById(id);

    return responsible;
  }

  public async getByEmail(email: string) {
    const responsible = await this.responsibleModel.findOne({ email });

    return responsible;
  }

  public async edit(id: string, name: string, email: string, country: string, phoneNumber: string) {
    const responsible = await this.responsibleModel.findByIdAndUpdate(id, {
      $set: {
        name,
        email,
        country,
        phoneNumber,
      },
    }, { new: true, useFindAndModify: false });

    return responsible;
  }

  public async delete(id: string) {
    await this.responsibleModel.findByIdAndDelete(id);
  }

  public async verifyForDependent(id: string, dependentId: string) {
    const responsible = await this.getById(id);

    for (const i of responsible.dependents) {
      if (i === dependentId) {
        return true;
      }
    }

    return false;
  }

  public async addDependent(id: string, dependentId: Types.ObjectId) {
    const responsible = await this.responsibleModel.findByIdAndUpdate(id, {
      $push: { dependents: dependentId },
    }, { new: true });

    return responsible;
  }

  public async removeDependent(id: string, dependentId: Types.ObjectId) {
    const responsible = await this.responsibleModel.findByIdAndUpdate(id, {
      $pull: { dependents: dependentId },
    }, { new: true });

    return responsible;
  }

  public async getContacts(list: Array<string>) {
    const contactList = await Promise.all(list.map(async (x) => await this.getById(x)));

    return contactList;
  }

  public async setLocation(id: string, longitude: string, latitude:string) {
    const responsible = await this.responsibleModel.findByIdAndUpdate(id, {
      $set: {
        longitude,
        latitude,
      },
    }, { new: true });

    return responsible;
  }

  public async getLocation(id: string) {
    const responsible = await this.responsibleModel.findById(id);
    const { longitude, latitude } = responsible;

    return { longitude, latitude };
  }
}

export default ResponsibleServices;
