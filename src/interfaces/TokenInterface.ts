import { Types } from 'mongoose';

interface IToken {
  secret: string,
  method: string,
  belong: string,
}

export default IToken;
