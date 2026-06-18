import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER as string,
    to,
    subject: 'Your Registration OTP',
    text: `Your OTP for registration is: ${otp}`,
    html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
