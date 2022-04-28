import mongoose, { Schema } from 'mongoose';

import IToken from '@interfaces/TokenInterface';

const TokenSchema = new Schema<IToken>({
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
    type: Date, default: Date.now, expires: 600,
  },
});

const Token = mongoose.model<IToken>('Token', TokenSchema);

export default Token;
