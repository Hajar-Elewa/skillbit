import * as nodemailer from 'nodemailer';
import 'dotenv/config';


import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,        
//   secure: false,    
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASS,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// })


// export const sendEmail = async ( 
//   options: nodemailer.SendMailOptions,
// )=> {
//   await transporter.sendMail(options) 
//   return true
// }


//every time we call sendEmail function it will create a new transporter which is not efficient so we can create transporter once and reuse it every time we call sendEmail function.ودا في الطريقة اللي فوق
// export async function sendEmail(sendMailOptions: nodemailer.SendMailOptions) {
//     const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASS,
//     },
//     tls: {
//     rejectUnauthorized: false
//     }
//     });

//     await transporter.sendMail(sendMailOptions);
// }