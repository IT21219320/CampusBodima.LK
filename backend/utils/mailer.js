import nodemailer from 'nodemailer';

export const sendMail = (email, text, subject) => {
    
    const mailTransporter  = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODE_MAILER_USERNAME,
          pass: process.env.NODE_MAILER_PASSWORD,
        },
    });
    
    let mailDetails = {
    from: 'info.campusbodima@gmail.com',
    to: email,
    subject: subject,
    html: text
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            console.log('Email sent successfully');
        }
    });

}