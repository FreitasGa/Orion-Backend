import { Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import IDependent from '@interfaces/DependentInterface';
import Dependent from '@models/Dependent';

class DependentService {
  private dependentModel: Model<IDependent>

  constructor() {
    this.dependentModel = Dependent;
  }

  public async create(dependent: IDependent) {
    const newDependent = await this.dependentModel.create(dependent);
    newDependent.password = undefined;

    return newDependent;
  }

  public async verify(param: string) {
    const dependentExists = await this.dependentModel.findOne({
      $or: [{ email: param }, { cpf: param }, { phoneNumber: param }],
    });

    if (dependentExists) {
      return true;
    }

    return false;
  }

  public async verify2(email: string, cpf: string, phoneNumber: string) {
    const dependentExists = await this.dependentModel.findOne({
      $or: [{ email }, { cpf }, { phoneNumber }],
    });

    if (dependentExists) {
      return true;
    }

    return false;
  }

  public async getByEmailWithPassword(email: string) {
    const dependent = await this.dependentModel.findOne({ email }).select('+password');

    return dependent;
  }

  public async getByIdWithPassword(id: string) {
    const responsible = await this.dependentModel.findById(id).select('+password');

    return responsible;
  }

  public async comparePassword(password: string, rePassword: string) {
    if (await bcrypt.compare(password, rePassword)) {
      return true;
    }

    return false;
  }

  public async changePassword(email: string, password: string) {
    const dependent = await this.getByEmailWithPassword(email);
    dependent.password = password;
    dependent.save();

    return dependent;
  }

  public async generateJwt(params: Record<string, unknown>) {
    const jsonToken = jwt.sign(params, process.env.TOKEN_SECRET, {
      expiresIn: 86400,
    });

    return jsonToken;
  }

  public async setActive(id: string) {
    const dependent = await this.dependentModel.findById(id).updateOne({ active: true });

    return dependent;
  }

  public async getById(id: string) {
    const dependent = await this.dependentModel.findById(id);

    return dependent;
  }

  public async getByEmail(email: string) {
    const dependent = await this.dependentModel.findOne({ email });

    return dependent;
  }

  public async edit(id: string, name: string, email: string, country: string, phoneNumber: string) {
    const dependent = await this.dependentModel.findByIdAndUpdate(id, {
      $set: {
        name,
        email,
        country,
        phoneNumber,
      },
    }, { new: true, useFindAndModify: false });

    return dependent;
  }

  public async delete(id: string) {
    await this.dependentModel.findByIdAndDelete(id);
  }

  public async verifyForResponsible(id: string, responsibleId: string) {
    const dependent = await this.getById(id);

    for (const i of dependent.responsible) {
      if (i === responsibleId) {
        return true;
      }
    }

    return false;
  }

  public async addResponsible(id: string, responsibleId: Types.ObjectId) {
    const dependent = await this.dependentModel.findByIdAndUpdate(id, {
      $push: { responsible: responsibleId },
    }, { new: true });

    return dependent;
  }

  public async removeResponsible(id: string, responsibleId: Types.ObjectId) {
    const dependent = await this.dependentModel.findByIdAndUpdate(id, {
      $pull: { responsible: responsibleId },
    }, { new: true });

    return dependent;
  }

  public async getContacts(list: Array<string>) {
    const contactList = await Promise.all(list.map(async (x) => await this.getById(x)));

    return contactList;
  }

  public async setLocation(id: string, longitude: string, latitude:string) {
    const dependent = await this.dependentModel.findByIdAndUpdate(id, {
      $set: {
        longitude,
        latitude,
      },
    }, { new: true });

    return dependent;
  }

  public async getLocation(id: string) {
    const dependent = await this.dependentModel.findById(id);
    const { longitude, latitude } = dependent;

    return { longitude, latitude };
  }
}

export default DependentService;
