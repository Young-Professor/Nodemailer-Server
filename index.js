const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const emailExistence = require('email-existence');
const path = require('path');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send('Express JS on Vercel');
});

let Name = '';
let Email = '';
let Message = '';
let Source= '';

app.post('/mails', async (req, res) => {
    Name = req.body.name;
    Email = req.body.email;
    Message = req.body.message;
    Source= req.body.source
    console.log(Name, Email, Message);

    // create nodemailer transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    try {
        // send email using nodemailer
        const emailRes = await transporter.sendMail({
            from: { name: Name, address: Email },
            to: process.env.EMAIL,
            replyTo: Email,
            subject: Source,
            html: `
                <p>${Message}</p>
                <h4>Message From: ${Name}</h4>
            `,
        });
        console.log('message sent');
        res.status(200).json({ message: 'Received the message and sent email!' }); // added a response message
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to send email');
    }
});



//Verification of Email
let email='';
app.post('/sendmail', async (req, res) => {
    email = req.body; // get the email from the request body
     console.log(email);
    // create nodemailer transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    try {
        // send email using nodemailer
        const emailRes = await transporter.sendMail({
            from: { name: "InnovateZone", address: process.env.EMAIL },
            to: email.email,
            replyTo: process.env.EMAIL,
            subject: "Approval",
            html: `
            <p>Your account is Approved you can login now using this link</p>
            <p>https://innovate-zone.vercel.app/login</p>
            <h4>Message From: InnovateZone</h4>
            `,
        });
        console.log('message sent');
        res.status(200).json({ message: 'Received the message and sent email!' }); // added a response message
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to send email');
    }
});




app.post("/api/verify", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const token = req.body.verification;

  // Check if the provided email exists
  emailExistence.check(email, async (err, exists) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error occurred while checking email existence.' });
    }

    if (!exists) {
      // If the email does not exist, notify the user and return an error response
      return res.status(400).json({ error: 'The provided email does not exist.' });
    }

    // The email exists, proceed with sending the verification email

    // Create the verification link with the token
    const verificationLink = `https://campus-closet.vercel.app/auth/account/verify/${token}`;
    try {
      // create nodemailer transporter object
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });

      // send email using nodemailer
      const emailRes = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Verification',
        html: `
          <p>Hello ${name},</p>
          <p>Thank you for registering on our website. Please click on the following link to verify your email:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>If you didn't register on our website, please ignore this email.</p>
        `,
      });
      console.log('Verification email sent');
      return res.status(200).json({ message: "Sign up successful. Verification email sent." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  });
});


    //orders sent to the seller
app.post("/api/notifyOwner",async (req,res)=>{
    const buyerDetails= req.body.buyerDetails;
    const email=buyerDetails[0][0].email;
    const name=buyerDetails[0][0].full_name;
    const PageLink = `https://campus-closet.vercel.app/`;
        try {
      // create nodemailer transporter object
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      
    // send email using nodemailer
    const emailRes = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Campus Closet - Your Item Has Been Ordered!',
        html: `
        <p>Hello ${name},</p>
        <p>Your item has been ordered!</p>
        <p>Thank you for selling on our website. A customer has placed an order for your product. Please check your dashboard or account for more details about the order.</p>
        <p>If you have any questions or need further assistance, please feel free to contact us.</p>
        <p>Thank you for being a part of our marketplace!</p>
        <p>${PageLink}</p>
        `,
      });
    //   console.log('Verification email sent');
      return res.status(200).json({ message: "Notification was sent successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });      
    }
    })




app.listen(port, (err, res) => {
    if (err) {
        console.log(err);
        return res.status(500).send(err.message);
    } else {
        console.log('[INFO] Server Running on port:', port);
    }
});
