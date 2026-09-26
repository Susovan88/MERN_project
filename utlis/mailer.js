
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    secure:true,
    host:'smtp.gmail.com',
    port:465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports.sendListingCreatedEmail = async (to, listingTitle) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: "Your Listing Has Been Created",

        text: `Hello,

Your listing "${listingTitle}" has been created successfully on NextDestination.

Thank you for using NextDestination.
`
    };

    await transporter.sendMail(mailOptions);

    console.log("Listing creation email sent to:", to);
};
