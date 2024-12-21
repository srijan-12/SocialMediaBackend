import express from 'express'
import {sanitizeData} from '../Middlewares/sanatizeRigister.js'
import {sanitizeDataLogin} from "../Middlewares/sanatizeLogin.js"
import { isLoggedIn } from '../Middlewares/isLoggedIn.js';
import { sanatizeUpdate } from '../Middlewares/sanatizeUpdate.js';
import User from '../Module/user.model.js';
const userRouter = express.Router();

userRouter.post('/register', sanitizeData,async(req,res)=>{
    try{
        const{fullName, email, password, image, gender, phoneNumber} = req.body
        // console.log(fullName, email, password, image, gender, phoneNumber)
        const hashedPass = await User.hashPassword(password)
        // console.log(hashedPass);
        const userData = new User({fullName, email, password : hashedPass, image, gender, phoneNumber})
        await userData.save()
        const token = await userData.getJwt();
        // console.log(token)
        userData.tokens.push(token)
        await userData.save()
        const userObject = userData.toObject();
        delete userObject.password;
        res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 })
        return res.status(200).json({result : 'registered', error : null, data: userObject})
    }catch(err){
        return res.status(400).json({result : 'Failed to register', error : err.message})
    }

})

userRouter.post('/login',sanitizeDataLogin,async(req,res)=>{
    try{
       const {email, password} = req.body
       const foundUser = await User.findOne({ email }).select('+password +tokens');
       if(foundUser){
            const result = await foundUser.comparePassword(password)
            if(result){
                const token = await foundUser.getJwt()
                foundUser.tokens.push(token)
                await foundUser.save()
                const userObject = foundUser.toObject();
                delete userObject.password;
                res.cookie("token" , token, { maxAge: 24 * 60 * 60 * 1000 })
                return res.status(200).json({result : 'logged in', error : null, data: userObject})
            }else{
                throw new Error("Invalid-credentials")
            }
       }else{
            throw new Error("Invalid-credentials")
       }
    }catch(err){
        return res.status(400).json({result : 'Failed to login', error : err.message})
    }
})


userRouter.get("/get-details/:userId", isLoggedIn, async(req,res)=>{
    try{
        const loggedInUser = req.user
        if(!loggedInUser) throw new Error("Please login again")
        else return res.status(200).json({result : 'success', error : null, data: loggedInUser})
    }catch(err){
        return res.status(400).json({result : 'Failed to login', error : err.message})
    }
})


userRouter.post('/logout/:userId', isLoggedIn, async(req,res)=>{
    const {token} = req.cookies;
    const user = req.user
    const foundUser = await User.findById(user._id).select('+tokens')
    foundUser.tokens = foundUser.tokens.filter((t)=> t !== token)
    await foundUser.save()
    req.user = null
    res.cookie("token", null, {
        maxAge : 0
    } )
    return res.status(200).json({"status":"logged out", data : req.user});
})


userRouter.post('/logout-all-devices/:userId', isLoggedIn, async(req,res)=>{
    const user = req.user
    const foundUser = await User.findById(user._id).select('+tokens')
    foundUser.tokens = []
    await foundUser.save()
    req.user = null
    res.cookie("token", null, {
        maxAge : 0
    } )
    return res.status(200).json({"status":"logged out", data : req.user});
})


userRouter.patch("/update-details/:userId", isLoggedIn, sanatizeUpdate, async(req,res)=>{
    try{
        const {fullName, image, gender, phoneNumber} = req.body
        const {userId} = req.params
        const foundUser = await User.findByIdAndUpdate(userId,{fullName, image, gender, phoneNumber},{new:true})
        // console.log(foundUser)
        return res.status(200).json({result : 'success', error : null, data: foundUser})
    }catch(err){
        return res.status(200).json({"status":"logged out", data : req.user});
    }
})  


userRouter.post('')





export default userRouter

