const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send password reset email
async function sendPasswordResetEmail(email, name, resetLink) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; text-align: center; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 איפוס סיסמה</h1>
          </div>
          <div class="content">
            <p>שלום ${name},</p>
            <p>קיבלנו בקשה לאיפוס סיסמתך ל-MyServices CRM.</p>
            <p>אם זו לא היתה אתה, תוכל להתעלם מהדוא״ל הזה.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">אפס את הסיסמה</a>
            </p>
            <p>או עבור לקישור זה:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${resetLink}
            </p>
            <p style="color: #999; font-size: 12px;">קישור זה תקף ל-1 שעה בלבד.</p>
          </div>
          <div class="footer">
            <p>© 2026 MyServices CRM. כל הזכויות שמורות.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 איפוס סיסמה - MyServices CRM',
      html: htmlContent
    });

    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failure shouldn't block login
    return false;
  }
}

module.exports = { sendPasswordResetEmail };
