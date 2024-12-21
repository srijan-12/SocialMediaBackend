import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({

    fullName: {
        firstName : {
            type : String,
            required : true,
            trim : true,
            validate(value){
                if(value.length < 3) throw new Error('First name must be atleast 3-characters long DB')
            }
        },
        lastName : {
            type : String,
            trim : true,
        }
    },

    email:{
        type : String,
        required : true,
        unique : true,
        trim : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error(`Invalid email DB`);
            }
        }
    },

    password: {
        type : String,
        required : true,
        trim : true,
        select : false,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error(`Enter strong password DB`);
            }
        }
    },
    image : {
        type : String,
        trim : true,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error(`Invalid Image DB`);
            }
        }
    },
    gender : {
        type : String,
        trim : true,
        validate(value){
            if(!['male', 'female', 'others'].includes(value)){
                throw new Error(`Invalid gender DB`);
            }
        }
    },
    phoneNumber : {
        type : String,
        trim : true,
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error(`Invalid phone-number DB`);
            }
        }
    },
    tokens:{
        type: [String],
        select:false,
    }
},{timestamps: true})

userSchema.statics.hashPassword = async function(password){
    return bcrypt.hash(password, 10)
}
userSchema.methods.getJwt = async function () {
    const token = await jwt.sign({_id: this._id}, process.env.SECRET_KEY)
    return token
}
userSchema.methods.comparePassword = async function(userInputPass) {
    return await bcrypt.compare(userInputPass, this.password)
}
const User = mongoose.model("User", userSchema);
export default User