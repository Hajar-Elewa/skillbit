import { Resend } from 'resend';
import 'dotenv/config';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  // If no 'from' is provided, we use the one from env or the Resend testing email
  const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html || '',
      text: options.text || '',
    });

    return true;
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    throw error;
  }
};