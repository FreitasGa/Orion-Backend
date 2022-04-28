import mongoose, { Schema } from 'mongoose';

import IToken from '@interfaces/TokenInterface';

const DurableTokenSchema = new Schema<IToken>({
  secret: {
    type: String, required: true,
  },
  method: {
    type: String, required: true,
  },
  belong: {
    type: String, required: true,
  },
  createdAt: {
    type: Date, default: Date.now,
  },
});

const DurableToken = mongoose.model<IToken>('DurableToken', DurableTokenSchema);

export default DurableToken;
