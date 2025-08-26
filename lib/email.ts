import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const FROM = process.env.EMAIL_FROM || "JobSentry <no-reply@jobsentry.local>";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw error;
}
