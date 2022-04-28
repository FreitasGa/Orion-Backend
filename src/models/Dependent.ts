/* eslint-disable func-names */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

import IDependent from '../interfaces/DependentInterface';

const DependentSchema = new Schema<IDependent>({
  name: {
    type: String, required: true,
  },
  cpf: {
    type: String, required: true, unique: true,
  },
  email: {
    type: String, required: true, unique: true, lowercase: true,
  },
  password: {
    type: String, required: true, select: false,
  },
  country: {
    type: String, required: true,
  },
  phoneNumber: {
    type: String, required: true, unique: true,
  },
  responsible: [{
    type: String,
  }],
  active: {
    type: Boolean, default: false,
  },
  profileImg: {
    type: String, default: 'https://upload-orion.s3.amazonaws.com/b5fad4d86ed6d7bf09cd4d7e83fe0964-Doguinho.jpeg',
  },
  longitude: {
    type: String,
  },
  latitude: {
    type: String,
  },
}, { timestamps: true });

DependentSchema.pre<IDependent>('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Dependent = mongoose.model<IDependent>('Dependent', DependentSchema);

export default Dependent;
