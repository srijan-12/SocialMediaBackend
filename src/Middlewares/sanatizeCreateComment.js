export const sanitizeCreateComment = async(req, res, next) => {
    try{
        const{content} = req.body
        if(!content) throw new Error('Please fillup your thoughts')
        if(content && content.trim().length < 1) throw new Error('Please write valid captian')
        console.log('sanatized comment content post')
        next();
    }catch(err){
        res.status(400).json({result : 'Failed to register', error : err.message})
    }
};

