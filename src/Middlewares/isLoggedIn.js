import jwt from 'jsonwebtoken'
import User from '../Module/user.model.js'
export const isLoggedIn = async(req, res, next) =>{
    try{
        const {token} = req.cookies
        const {userId} = req.params
        if(!token) throw new Error('Please login again')
        const decodedValue = await jwt.verify(token, process.env.SECRET_KEY)
        // console.log(typeof decodedValue._id)
        // console.log(typeof userId)
        const foundUser = await User.findById(decodedValue._id).select('-password +tokens')
        const isTokenPresent = foundUser.tokens.find((t)=>t == token)

        if(foundUser && isTokenPresent && (decodedValue._id === userId || decodedValue._id === String(foundUser._id))){
            const userObject = foundUser.toObject();
            delete userObject.tokens;
            req.user = foundUser
            console.log('This is done')
            next()
        }
        else throw new Error('Please login again')
    }catch(err){
        res.status(400).json({result : 'Failed to login', error : err.message})
    }
}