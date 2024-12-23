import express from 'express'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { generateOTP } from '../utilities/generateOTP.js'
import { sendMail } from '../utilities/mailConfig.js'
import { isLoggedIn } from '../Middlewares/isLoggedIn.js'
import { hashOTP } from '../utilities/hashingOtp.js'
import OtpModel from '../Module/otp.model.js'
import User from '../Module/user.model.js'
const otpRouter = express.Router()


otpRouter.post("/send", isLoggedIn, async(req,res)=>{
    try{
        const generatedOtp = generateOTP(6)
        const loggedInUserEmail = req.user.email
        const loggedInUserName = req.user.fullName.firstName
        await sendMail(generatedOtp, loggedInUserEmail, loggedInUserName)
        const tokenisedOTP = await hashOTP(generatedOtp, loggedInUserEmail)
        const newOTP = new OtpModel({hashOTP: tokenisedOTP, generatedBy: req.user})
        await newOTP.save()
        return res.status(200).json({result : 'OTP hs been send to your email id', error : null})
    }catch(err){
        return res.status(400).json({result : 'failed to authenticate', error : err.message})
    }
})


otpRouter.post("/verify", isLoggedIn, async(req,res)=>{
    try{
        const {otp} = req.body
        if(!otp) throw new Error('Please enter valid otp')
        const loggedInUserId = req.user._id
        const foundOtp = await OtpModel.findOne({generatedBy:loggedInUserId})
        if(!foundOtp){
            throw new Error('Something went wrong. Please re-initiate the otp')
        }
        const decodedToken = await jwt.verify(foundOtp.hashOTP, process.env.SECRET_KEY)
        console.log(decodedToken)

        const generatedOtpFromDecodedToken = decodedToken.generatedOtp
        const userEmail = decodedToken.loggedInUserEmail
        const checkUserIsValid = await User.findOne({email : userEmail})
        if(checkUserIsValid && checkUserIsValid._id.equals(loggedInUserId)){
            if(generatedOtpFromDecodedToken === otp){
                foundOtp.verified = true
                await foundOtp.save()
                return res.status(200).json({result : 'sucessfully validated', error : null})
            }else{
                return res.status(400).json({result : 'in-valid otp', error : null})
            }
        }
    }catch(err){
        return res.status(400).json({result : 'failed to authenticate', error : err.message})
    }
})

otpRouter.post("/reset-password", isLoggedIn, async(req,res)=>{
    try{    
        const {password, confirmPassword} = req.body
        if(password !== confirmPassword){
            throw new Error('both fields content should be same')
        }
        if(!validator.isStrongPassword(password) || !validator.isStrongPassword(confirmPassword)){
            throw new Error('Please enter a strong password')
        }
        const loggedInUserId = req.user._id
        const foundOtp = await OtpModel.findOne({generatedBy:loggedInUserId})
        if(!foundOtp){
            throw new Error('Something went wrong. Please re-initiate the otp')
        }
        if(foundOtp.verified === false){
            throw new Error('Please verify the otp send over your mail')
        }
        const foundUser = await User.findById(loggedInUserId).select('+password')
        const hashPass = await foundUser.getJwt(password)
        foundUser.password = hashPass
        await foundUser.save()
        await OtpModel.findByIdAndDelete(foundOtp._id)
        return res.status(200).json({result : 'password has been changed ', error : null})

    }catch(err){
        return res.status(400).json({result : 'failed to authenticate', error : err.message})
    }
})



export default otpRouter