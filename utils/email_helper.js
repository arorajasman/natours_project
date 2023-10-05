const nodemailer = require("nodemailer");

exports.sendEmail = async ({ email, subject, message }) => {
  // creating a transporter to send the email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER_NAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // setting the options for email
  const mailOptions = {
    from: "Natours Project <natours@development.com>",
    to: email,
    subject,
    text: message,
  };
  // using the sendMail() method to send the email to the user
  await transporter.sendMail(mailOptions);
};
