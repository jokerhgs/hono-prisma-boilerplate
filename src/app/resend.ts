import { Resend } from "resend";

function createResend(apiKey: string) {
  return new Resend(apiKey);
}

export async function sendVerificationEmail(apiKey: string, email: string, url: string) {
  const resend = createResend(apiKey);
  const { error } = await resend.emails.send({
    from: "Acme <noreply@yourdomain.com>",
    to: [email],
    subject: "Verify your email address",
    html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
  });
  if (error) console.error("sendVerificationEmail failed:", error);
}

export async function sendWelcomeEmail(apiKey: string, email: string, name: string) {
  const resend = createResend(apiKey);
  const { error } = await resend.emails.send({
    from: "Acme <welcome@yourdomain.com>",
    to: [email],
    subject: "Welcome to Acme!",
    html: `<h1>Welcome, ${name}!</h1><p>Thanks for joining us.</p>`,
  });
  if (error) console.error("sendWelcomeEmail failed:", error);
}

export async function sendPasswordResetEmail(apiKey: string, email: string, url: string) {
  const resend = createResend(apiKey);
  const { error } = await resend.emails.send({
    from: "Acme <noreply@yourdomain.com>",
    to: [email],
    subject: "Reset your password",
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
  if (error) console.error("sendPasswordResetEmail failed:", error);
}
