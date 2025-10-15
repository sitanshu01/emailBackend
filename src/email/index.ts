import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, content: string) {
  const { error } = await resend.emails.send({
    from: "Sitanshu <onboarding@resend.dev>",
    to: [to],
    subject: "Authentication Code",
    html: content,
  });

  if (error) {
    console.error({ error });
    return { success: false, error: "Couldn't send email. Please try again" };
  }

  return { success: true };
}
