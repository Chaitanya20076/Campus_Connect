
export async function sendOtpEmail(email, otp) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "CampusConnect";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo environment variables are missing.");
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [{ email }],
        subject: "Your CampusConnect verification code",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:30px;color:#1F273E">
            <h1 style="color:#1F273E">Campus<span style="color:#DC9851">Connect</span></h1>
            <h2>Verify your email address</h2>
            <p>Use the following OTP to complete your CampusConnect signup.</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:10px;background:#FAF4EB;padding:22px;text-align:center;border-radius:10px;color:#1F273E">
              ${otp}
            </div>
            <p>This code expires in <b>5 minutes</b>.</p>
            <p>If you did not request this code, you can ignore this email.</p>
          </div>
        `
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Brevo API error:", data);
    throw new Error(data.message || "Failed to send verification email.");
  }

  return data;
}
