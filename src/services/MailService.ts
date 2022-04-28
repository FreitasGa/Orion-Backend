import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

import config from '@config/mailer';

class MailService {
  public async send(secret: string, to: string, type: string, subject: string) {
    const source = fs.readFileSync(path.join(__dirname, '../resources', `/${type}.hbs`), 'utf-8');
    const template = handlebars.compile(source);
    const htmlToSend = template({ secret });

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailSent = await transporter.sendMail({
      subject,
      from: 'Orion <orion.app.mailer@gmail>',
      to,
      html: htmlToSend,
    });

    return mailSent;
  }
}

export default new MailService();
