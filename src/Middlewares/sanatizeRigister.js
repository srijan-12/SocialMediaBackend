import validator from 'validator'
import User from '../Module/user.model.js';
export const sanitizeData = async(req, res, next) => {
    try{
        const{fullName, email, password, image, gender, phoneNumber} = req.body
        if(!fullName.firstName || fullName.firstName.length < 3) throw new Error('First name must be atleast 3-characters long')
        const foundUser = await User.find({email})
        // console.log(foundUser,"This is found user")
        if(foundUser.length > 0) throw new Error('User already exists')
        if(!email || !validator.isEmail(email)) throw new Error('Invalid email')
        if(!password || !validator.isStrongPassword(password)) throw new Error('Enter strong password')
        if(!gender || !['male', 'female', 'others'].includes(gender)) throw new Error('Invalid gender password')
        if(!phoneNumber || !validator.isMobilePhone(phoneNumber)) throw new Error('Invalid phone-number')
        // console.log('sanatized')
        next();
    }catch(err){
        res.status(400).json({result : 'Failed to register', error : err.message})
    }
};

