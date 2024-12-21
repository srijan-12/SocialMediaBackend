import validator from 'validator'
export const sanitizeDataLogin = async(req, res, next) => {
    try{
        const{email, password} = req.body
        if(!email || !validator.isEmail(email)) throw new Error('Invalid email')
        if(!password) throw new Error('Enter strong password')
        console.log('sanatized Login')
        next();
    }catch(err){
        res.status(400).json({result : 'Failed to register', error : err.message})
    }
};

