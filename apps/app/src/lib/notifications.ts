const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAILS = process.env.NOTIFICATION_EMAILS; // comma-separated

export async function sendNotificationEmail(subject: string, body: string) {
  if (!RESEND_API_KEY || !NOTIFICATION_EMAILS) {
    console.warn("Resend not configured — skipping email notification");
    return;
  }

  const recipients = NOTIFICATION_EMAILS.split(",").map((e) => e.trim());

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kavah <notifications@joinkavah.com>",
        to: recipients,
        subject,
        text: body,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
    } else {
      console.log("Notification email sent:", data);
    }
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
