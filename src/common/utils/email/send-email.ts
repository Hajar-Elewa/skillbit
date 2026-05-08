import SibApiV3Sdk from 'sib-api-v3-sdk';
import 'dotenv/config';

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY!;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.SENDER_EMAIL!,
        name: 'Skillbit',
      },

      to: [{ email: to }],

      subject,

      htmlContent: html,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};