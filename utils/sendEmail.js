const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
    //console.log(options)
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        //secure: true,
        service: "gmail",
        auth: {
            user: "abhishekpandey95609@gmail.com",
            pass: "yihugcwjpaoijpld"  //application specific password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: "abhishekpandey95609@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
