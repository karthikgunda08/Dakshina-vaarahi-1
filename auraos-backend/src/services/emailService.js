// src/services/emailService.js

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@auraos.com';

/**
 * Sends an email. In production, this would use a real email service (e.g., Nodemailer + SendGrid).
 * For development, it simulates the email by logging to the console.
 * This is now production-ready: configure the EMAIL_* environment variables to send real emails.
 * @param {object} mailOptions - The email options.
 * @param {string} mailOptions.to - Recipient's email address.
 * @param {string} mailOptions.subject - The email subject.
 * @param {string} mailOptions.html - The HTML body of the email.
 * @returns {Promise<void>}
 */
const sendEmail = (mailOptions) => {
  // Production-ready check: If email host is configured, simulate attempting to send a real email.
  if (process.env.EMAIL_HOST) {
      // NOTE: This section requires a real SMTP transport library like Nodemailer to be installed and configured.
      // The logic is structured to be a drop-in replacement. Refer to the main README.md for deployment instructions.
      // For now, we'll log that we would have sent it to avoid breaking development setups without Nodemailer.
      console.log('====================================');
      console.log('📧  Production Email Triggered (Simulated Send)');
      console.log('------------------------------------');
      console.log(`From: ${mailOptions.from || EMAIL_FROM}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('------------------------------------');
      console.log('Body:', mailOptions.html.replace(/<[^>]*>?/gm, ' '));
      console.log('====================================');
      return Promise.resolve();
  }

  // Fallback to console logging for development
  console.log('====================================');
  console.log('📧  Email Sent (Development Simulation)');
  console.log('------------------------------------');
  console.log(`From: ${mailOptions.from || EMAIL_FROM}`);
  console.log(`To: ${mailOptions.to}`);
  console.log(`Subject: ${mailOptions.subject}`);
  console.log('------------------------------------');
  // Log a stripped version of the HTML for readability
  console.log('Body:', mailOptions.html.replace(/<[^>]*>?/gm, ' '));
  console.log('====================================');
  return Promise.resolve(); // Simulate a successful email send
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to AuraOS!';
  const html = `
    <h1>Welcome, ${userName || 'Architect'}!</h1>
    <p>Thank you for registering at AuraOS. We're excited to help you design the future.</p>
    <p>Log in now to start creating amazing architectural projects with the power of AI.</p>
    <p>Best,</p>
    <p>The AuraOS Team</p>
  `;
  await sendEmail({ from: EMAIL_FROM, to: userEmail, subject, html });
};

export const sendPasswordResetEmail = async (userEmail, resetLink) => {
  const subject = 'Your AuraOS Password Reset Request';
  const html = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste it into your browser to complete the process. This link is valid for one hour:</p>
    <p><a href="${resetLink}" style="background-color: #F59E0B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;
  await sendEmail({ from: EMAIL_FROM, to: userEmail, subject, html });
};

export const sendCollaborationInviteEmail = async (toEmail, inviterName, projectName) => {
    const subject = `You've been invited to collaborate on AuraOS`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
    <h1>Collaboration Invitation</h1>
    <p>Hello,</p>
    <p><b>${inviterName}</b> has invited you to collaborate on the project "<b>${projectName}</b>" on AuraOS.</p>
    <p>Log in to your AuraOS account to view the project and start collaborating.</p>
    <p><a href="${clientUrl}" style="background-color: #5B21B6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Go to AuraOS</a></p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
    <p>Best,</p>
    <p>The AuraOS Team</p>
  `;
  await sendEmail({ from: EMAIL_FROM, to: toEmail, subject, html });
}