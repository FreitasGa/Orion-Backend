const config = {
  host: 'smtp.gmail.com',
  port: 587,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
};

export default config;
