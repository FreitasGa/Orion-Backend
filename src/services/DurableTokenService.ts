import { Model } from 'mongoose';

import IToken from '@interfaces/TokenInterface';
import DurableToken from '@models/DurableToken';

class DurableTokenServices {
  private durableTokenModel: Model<IToken>

  constructor() {
    this.durableTokenModel = DurableToken;
  }

  public async create(token: IToken) {
    const newToken = await this.durableTokenModel.create(token);

    return newToken;
  }

  public async get(secret: string, method: string) {
    const newToken = await this.durableTokenModel.findOne({ secret, method });

    return newToken;
  }

  public async delete(id: string) {
    await this.durableTokenModel.findByIdAndDelete(id);
  }
}

export default DurableTokenServices;
