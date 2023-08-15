import nodemailer from 'nodemailer';

export const registerMail = (username, email, text, subject) => {
    
    const mailTransporter  = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "info.campusbodima@gmail.com",
          pass: "fsgumbgazxzxnqkl",
        },
    });
    
    let mailDetails = {
    from: 'info.campusbodima@gmail.com',
    to: email,
    subject: subject,
    text: text
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            console.log('Email sent successfully');
        }
    });

}