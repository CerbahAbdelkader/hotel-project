const nodemailer = require('nodemailer');

// Create email transporter - using Gmail with App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'hotel.saida.dz@gmail.com',
    pass: process.env.SMTP_PASS,
  },
});

// Send email to hotel admin when contact form is submitted
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;
    const hotelEmail = process.env.SMTP_USER || 'hotel.saida.dz@gmail.com';

    // Email to hotel admin
    const hotelMailOptions = {
      from: hotelEmail,
      to: hotelEmail,
      subject: `📨 Nouveau message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #D4A574 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0;">Nouveau Message de Contact</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>De:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'Non fourni'}</p>
            <p><strong>Sujet:</strong> ${subject}</p>
          </div>

          <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #8B7355; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <div style="background: #fffbf0; padding: 15px; border-left: 4px solid #D4A574; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Réponse:</strong> Pour répondre à ce message, vous pouvez répondre directement à cet email.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Message reçu le ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      `,
      replyTo: email || hotelEmail,
    };

    // Email confirmation to user (if email provided)
    const userMailOptions = email ? {
      from: hotelEmail,
      to: email,
      subject: `✓ Nous avons reçu votre message - Hôtel Saïda`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #D4A574 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0;">Merci de votre message</h2>
          </div>
          
          <p>Bonjour ${name},</p>
          
          <p>Nous avons bien reçu votre message concernant: <strong>${subject}</strong></p>
          
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #333;">
              Notre équipe examinera votre demande et vous répondra dans les plus brefs délais.
            </p>
          </div>

          <p>Merci d'avoir contacté <strong>Hôtel Saïda</strong></p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <div style="color: #999; font-size: 12px;">
            <p>Hôtel Saïda<br>
            Rue des Martyrs, Saïda 20000, Algérie<br>
            Tél: +213 (0) 48 20 00 00<br>
            Email: hotel.saida.dz@gmail.com</p>
          </div>
        </div>
      `,
    } : null;

    // Send hotel email
    await transporter.sendMail(hotelMailOptions);
    console.log(`✉️  Email sent to hotel admin`);

    // Send user confirmation if email provided
    if (userMailOptions) {
      await transporter.sendMail(userMailOptions);
      console.log(`✉️  Confirmation email sent to user`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Don't throw error - messages should still be saved even if email fails
    return { success: false, error: error.message };
  }
};

module.exports = { sendContactEmail };
