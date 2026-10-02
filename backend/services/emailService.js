function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

async function sendOtpEmail({ to, code, purpose }) {
  if (!isEmailConfigured()) {
    throw new Error('Resend email delivery is not configured.');
  }

  const isPasswordReset = purpose === 'reset';
  const action = isPasswordReset ? 'reset your password' : 'verify your email';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject: isPasswordReset ? 'Your MoodWorld password reset code' : 'Verify your MoodWorld email',
      text: `Use ${code} to ${action}. This code expires in 15 minutes. If you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#14212b;max-width:520px;margin:auto;padding:24px"><p style="color:#397c77;font-weight:700">MOODWORLD</p><h1 style="font-size:24px">Your one-time code</h1><p>Use this code to ${action}:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 15 minutes. If you did not request this, you can ignore this email.</p></div>`,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Email provider returned ${response.status}.`);
  }
}

module.exports = { isEmailConfigured, sendOtpEmail };