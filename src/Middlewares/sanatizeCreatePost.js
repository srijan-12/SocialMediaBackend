import validator from 'validator'
export const sanitizeCreatePost = async(req, res, next) => {
    try{
        const{captian, image} = req.body
        if(!captian && !image) throw new Error('Please fillup your thoughts')
        if(captian && captian.trim().length < 1) throw new Error('Please write valid captian')
        if(image && !validator.isURL(image)) throw new Error('In-valid image')
        console.log('sanatized create/update post')
        next();
    }catch(err){
        res.status(400).json({result : 'Failed to register', error : err.message})
    }
};

