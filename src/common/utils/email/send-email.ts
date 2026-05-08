import SibApiV3Sdk from 'sib-api-v3-sdk';
import 'dotenv/config';

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY!;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;       // ✅ string only, no ObjectId
  subject: string;
  html: string;
}) => {
  // ✅ Let the error bubble up to the caller
  await tranEmailApi.sendTransacEmail({
    sender: {
      email: process.env.SENDER_EMAIL!,
      name: 'Skillbit',
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
};