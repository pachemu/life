import nodemailer from 'nodemailer';
import { ENV } from '../../../../shared/env.js';
import type { EmailSender } from '../../domain/email.service.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.GOOGLE_USER_GMAIL,
    pass: ENV.GOOGLE_APP_PASSWORD,
  },
});

const sendEmail = async (message: string, email: string) => {
  try {
    await transporter.sendMail({
      from: ENV.GOOGLE_USER_GMAIL,
      to: email,
      subject: 'Life backend',
      text: message,
      html: `<b>${message}</b>`,
    });
  } catch (err) {
    console.error('Email send error:', err);
    throw err; // чтобы упало и в логах было видно
  }
};

export const emailRepository: EmailSender = { sendEmail };
