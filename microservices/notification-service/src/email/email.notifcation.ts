

import nodemailer from 'nodemailer';
// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT as string),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});


export async function sendEmail(receiverEmail: string, otpCode: number,) {

    const info = await transporter.sendMail({
      from: 'From Microservices App',
      to: receiverEmail,
      subject: "verification d'E-mail",
      text: "Hello use this code to verify your email address : " + otpCode,
      html: "<b>More information here .....</b>", // HTML body
    }).catch((error:any) => console.log("failed to send email verification"))
  

}