import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server/.env and root/.env
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

let transporter = null;

// Initialize mail transporter
export const initMailer = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass }
    });
    console.log(`📡 [Mailer] Connected to SMTP server (${host}:${port}) as ${user}`);
  } else {
    console.log(`⚠️  [Mailer] No SMTP credentials in server/.env (SMTP_USER/SMTP_PASS).`);
    console.log(`👉 To send real emails to inboxes, add your Gmail or SMTP credentials to server/.env`);
  }
};

// Dispatch verification code email
export const sendVerificationEmail = async ({ to, code, username }) => {
  if (!transporter) {
    initMailer();
  }

  const fromAddress = process.env.SMTP_FROM || `"Nicole Shayla VIP" <${process.env.SMTP_USER || 'no-reply@justfans.io'}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14; color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background-color: #131722; border: 1px solid #273148; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
        .accent { color: #00aff0; }
        .title { font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 16px; margin-bottom: 8px; text-align: center; }
        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 24px; }
        .code-box { background: #161c2b; border: 2px dashed #00aff0; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
        .code { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #00aff0; margin: 0; font-family: monospace; }
        .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">JUST<span class="accent">FANS</span></div>
          <div style="font-size: 11px; color: #c4b5fd; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Nicole Shayla VIP Club</div>
        </div>
        <div class="title">Confirm Your Email Address</div>
        <div class="text">
          Hey <strong>${username || 'there'}</strong>! Welcome to Nicole Shayla's official VIP platform. Enter the 6-digit confirmation code below to activate your account and access her vault:
        </div>
        <div class="code-box">
          <div class="code">${code}</div>
        </div>
        <div class="text" style="font-size: 12px; margin-bottom: 0;">
          This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} JustFans · Nicole Shayla Official VIP Portal
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter && process.env.SMTP_USER) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `Your Nicole Shayla VIP Verification Code: ${code}`,
        text: `Your 6-digit JustFans verification code is: ${code}. It expires in 10 minutes.`,
        html: htmlContent
      });
      console.log(`✅ [Mailer] Verification code email sent to ${to}. MessageId: ${info.messageId}`);
      return { success: true, delivered: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [Mailer Error] Failed to send email to ${to}:`, err.message);
      return { success: false, delivered: false, error: err.message };
    }
  } else {
    // Fallback when SMTP is not yet configured in .env
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL VERIFICATION CODE] To: ${to}`);
    console.log(`👉 CODE: ${code}`);
    console.log(`ℹ️  Note: Add SMTP_USER and SMTP_PASS to server/.env to deliver to real inbox`);
    console.log(`======================================================\n`);
    return { success: true, delivered: false, note: 'Awaiting SMTP credentials in server/.env' };
  }
};

