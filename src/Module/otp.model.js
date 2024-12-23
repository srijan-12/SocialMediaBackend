import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    hashOTP : {
        type : String,
        required : true,
        trim : true
    },
    generatedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    verified : {
        type: Boolean,
        default : false
    }
},{timestamps:true})

const OtpModel = mongoose.model("OtpModel", otpSchema)
export default OtpModel