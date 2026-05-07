import * as nodemailer from 'nodemailer';
import 'dotenv/config';
import * as dns from 'dns'; 


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true لمنفذ 465 (SSL/TLS)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },  
  tls: {
  rejectUnauthorized: false
},
  lookup: (hostname: string, options: any, callback: any) => {
    // التحقق: إذا لم يتم تمرير خيارات، نقوم بإنشائها
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    // إجبار استخدام IPv4
    options.family = 4;
    // استدعاء دالة الـ DNS الأصلية
    dns.lookup(hostname, options, callback);
  }
} as any); 


export const sendEmail = async ( 
  options: nodemailer.SendMailOptions,
)=> {
  await transporter.sendMail(options) 
  return true
}


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