import { text } from 'express';
import nodemailer from 'nodemailer'

export const sendMail = async(generatedOtp, loggedInUserEmail, loggedInUserName) =>{

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure : true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const reciever = {
        from : 'srijan4015@gmail.com',
        to : `${loggedInUserEmail}`,
        subject : 'Verification mail for password resetting',
        text: `
        Hello ${loggedInUserName}!
        Your OTP for password reset is ${generatedOtp}
    `,
    }

    transporter.sendMail(reciever, (error, emailResponse)=>{
        try{
            if(error) throw new Error('Something went wrong while sending the mail. Try again later')
            console.log('Email send sucessfully')
        }catch(err){
            console.log(err.message)
        }
    })
}