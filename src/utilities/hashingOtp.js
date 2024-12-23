import jwt from 'jsonwebtoken'

export const hashOTP = async(generatedOtp,loggedInUserEmail) =>{
    const otpPayload = {generatedOtp, loggedInUserEmail}
    const tokenisedOTP = await jwt.sign(otpPayload, process.env.SECRET_KEY, {expiresIn : '1h'})
    return tokenisedOTP
}