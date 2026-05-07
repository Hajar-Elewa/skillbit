import * as nodemailer from 'nodemailer';
import 'dotenv/config';


  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

export const sendEmail = async (
  options: nodemailer.SendMailOptions
) => {
  await transporter.sendMail(options)
  return true
}