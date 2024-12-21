import validator from 'validator'


export const sanatizeUpdate = async(req,res,next) =>{
    try{
        const {fullName, image, gender, phoneNumber} = req.body
        if(!fullName.firstName || fullName.firstName.length < 3) throw new Error('First name must be atleast 3-characters long')
        if(fullName.lastName && fullName.lastName.length < 2) throw new Error('Last name must be atleast 2-characters long')
        if(image && !validator.isURL(image)) throw new Error('Invalid image')
        if(!gender || !['male', 'female', 'others'].includes(gender)) throw new Error('Invalid gender password')
        if(!phoneNumber || !validator.isMobilePhone(phoneNumber)) throw new Error('Invalid phone-number')
            console.log('sanatize update')
        next()
    }catch(err){
        res.status(400).json({result : 'Failed to register', error : err.message})
    }
}