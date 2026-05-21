import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const backendUrl = "https://api.perturbai.io"; // Use production backend URL for email links
  const link = `${backendUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify your PRB account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Verify your email address</h2>
        <p>Thanks for registering. Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">
          Verify Email
        </a>
        <p style="margin-top:16px;font-size:13px;color:#6b7280">
          Or copy this link into your browser:<br>
          <a href="${link}">${link}</a>
        </p>
        <p style="font-size:12px;color:#9ca3af">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
    text: `Verify your PRB account\n\nClick the link below to verify your email address (expires in 24 hours):\n\n${link}\n\nIf you did not create an account, ignore this email.`,
  });
}
