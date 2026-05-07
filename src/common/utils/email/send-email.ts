import * as nodemailer from 'nodemailer';
import 'dotenv/config';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: options.from || `"Skillbit" <${process.env.EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || '',
      text: options.text || '',
    });

    return true;
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error);
    throw error;
  }
};