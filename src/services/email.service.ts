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
    from: `"Indoseed Agri Makmur" <${process.env.SMTP_USER}>`,
    to,
    subject: "Kode Verifikasi OTP Anda",
    text: `Kode OTP Anda adalah ${otp}. Berlaku selama 5 menit.`,
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:40px;background:#f4f7f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:10px;padding:30px;border:1px solid #eef2f1;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

          <div style="text-align:center;margin-bottom:25px;">
            <h2 style="margin:0;color:#2c3e50;font-weight:700;">
              Indoseed Agri Makmur
            </h2>
            <p style="margin-top:5px;color:#7f8c8d;font-size:14px;">
              Skema Authentication & Verifikasi Email
            </p>
          </div>

          <hr style="border:none;border-top:1px solid #eef2f1;margin-bottom:25px;" />

          <div style="font-size:16px;line-height:1.6;color:#34495e;">
            <p>Halo,</p>

            <p>
              Terima kasih telah mendaftar. Silakan gunakan kode OTP di bawah ini
              untuk memverifikasi alamat email Anda:
            </p>

            <div style="text-align:center;margin:30px 0;">
              <span
                style="
                  display:inline-block;
                  padding:15px 30px;
                  background:#e8f8f5;
                  border:1px solid #d1f2eb;
                  border-radius:8px;
                  color:#1abc9c;
                  font-size:32px;
                  font-weight:800;
                  letter-spacing:6px;
                "
              >
                ${otp}
              </span>
            </div>

            <p style="text-align:center;font-size:13px;color:#95a5a6;">
              Kode OTP ini berlaku selama <strong>5 menit</strong>.
              Jangan bagikan kode ini kepada siapa pun.
            </p>
          </div>

          <hr style="border:none;border-top:1px solid #eef2f1;margin:25px 0;" />

          <div style="text-align:center;font-size:12px;color:#bdc3c7;">
            &copy; ${new Date().getFullYear()} Indoseed Agri Makmur. All rights reserved.
          </div>

        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email successfully sent to ${to}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    console.log(`[DEV-MODE] OTP for ${to} is: ${otp}`);
  }
};
