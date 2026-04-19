import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service you want to use
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

export const sendPriceDropAlert = async (
  email: string, 
  productName: string | null, 
  oldPrice: number, 
  newPrice: number,
  url: string
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Price Tracker Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔥 Price Drop Alert: ${productName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2e6c80;">Good News!</h2>
          <p>The price for <strong>${productName}</strong> has dropped!</p>
          <p>Previous Price: <span style="text-decoration: line-through; color: #888;">$${oldPrice}</span></p>
          <p><strong>New Price: <span style="color: #27ae60; font-size: 1.2em;">$${newPrice}</span></strong></p>
          <a href="${url}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Buy Now</a>
        </div>
      `
    });
    console.log(`Alert sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
};
