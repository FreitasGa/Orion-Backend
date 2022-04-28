import { Model } from 'mongoose';

import IToken from '@interfaces/TokenInterface';
import Token from '@models/Token';

class TokenServices {
  private tokenModel: Model<IToken>

  constructor() {
    this.tokenModel = Token;
  }

  public async create(token: IToken) {
    const newToken = await this.tokenModel.create(token);

    return newToken;
  }

  public async get(secret: string, method: string) {
    const newToken = await this.tokenModel.findOne({ secret, method });

    return newToken;
  }

  public async delete(id: string) {
    await this.tokenModel.findByIdAndDelete(id);
  }
}

export default TokenServices;
