import express from 'express'
import { isLoggedIn } from '../Middlewares/isLoggedIn.js'
import Connection from '../Module/connection.model.js'
import User from '../Module/user.model.js'

const connectionRouter = express.Router()

connectionRouter.post("/send/:status/:toId", isLoggedIn, async(req,res)=>{
    try{
        const {status} = req.params
        const {toId} = req.params
        const fromId = String(req.user._id)
        if(!['interested', 'ignored'].includes(status)) throw new Error('In-valid status type')
        const foundToUser = await User.findById(toId)
        if(!foundToUser) throw new Error('User does not exists(to)')
        const foundConnection = await Connection.findOne({
            $or : [
                {fromUserId:fromId, toUserId:toId},
                {fromUserId:toId, toUserId:fromId}
            ]
        })
        if(foundConnection){
            const fromReq = foundConnection.fromUserId
            const toReq = foundConnection.toUserId
            if(foundConnection && fromReq.equals(fromId)  && foundConnection.status === 'interested' || foundConnection.status === 'ignored' || foundConnection.status === 'rejected'){
                throw new Error('Request already sent')
            }
            if(foundConnection && fromReq.equals(toId)  && foundConnection.status === 'interested' || foundConnection.status === 'ignored'){
                throw new Error('Request is pending for approval')
            }
            if(foundConnection && fromReq.equals(fromId)  && foundConnection.status === 'accepted'){
                throw new Error('You guys are already buddies')
            }
            if(foundConnection && fromReq.equals(toId)  && foundConnection.status === 'accepted'){
                throw new Error('You guys are already buddies')
            }
        }else{
            const newConnection = new Connection({fromUserId:fromId, toUserId:toId, status : status})
            await newConnection.save()
            await newConnection.populate({path:'fromUserId', select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v'})
            await newConnection.populate({path:'toUserId', select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v'})
            return res.status(200).json({result : 'request sent', error : null, data : newConnection})
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to update activity', error : err.message})
    }
})




connectionRouter.post("/response-to-request/:status/:reqId", isLoggedIn, async(req,res)=>{
        try{
            const {status} = req.params
            const {reqId} = req.params
            const fromId = String(req.user._id)
            if(!["accepted", "rejected"].includes(status)) throw new Error('In-valid status type')

            const foundConnection = await Connection.findById(reqId).select('-createdAt -updatedAt -__v').populate({path:   'fromUserId',
                select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v'
                }).populate({path: 'toUserId',
                select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v'
            })
            // console.log(foundConnection)
            if(!foundConnection || foundConnection.status !== 'interested') throw new Error('No such pending request')
            else{
                foundConnection.status = status
                await foundConnection.save()
                return res.status(200).json({result : `Request has been ${status}`, error:null, data: foundConnection})
            }
        }catch(err){
            return res.status(400).json({result : 'Failed to update status', error : err.message})
        }
})


//all pending request
connectionRouter.get("/get-pending-request", isLoggedIn, async(req,res)=>{
    try{
        const loggedInUserId = req.user._id
        const foundConnectionArray = await Connection.find({toUserId: loggedInUserId, status : "interested"}).select('-createdAt -updatedAt -__v -toUserId -status ').populate({path:   'fromUserId',
            select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v '
            })//.populate({path: 'toUserId',
            //select : '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v'
       // })
        if(foundConnectionArray < 1){
            return res.status(200).json({result : `No pending request to show`, error:null, data: foundConnectionArray})
        }
        else{
            return res.status(200).json({result : `All pending requests`, error:null, data: foundConnectionArray})
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to fetch pending request list', error : err.message})
    }
})


connectionRouter.get("/get-friends", isLoggedIn, async(req,res)=>{
    try{
        const loggedInUserId = req.user._id
        const foundConnectionArray = await Connection.find({$or:[{fromUserId : loggedInUserId, status: 'accepted'}, {toUserId : loggedInUserId, status : 'accepted'}]}).select('-createdAt -updatedAt -__v -status -fromUserId -_id').populate([
            {
                path: 'fromUserId',
                match: { _id: { $ne: loggedInUserId } },
                select: '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v -_id',
            },
            {
                path: 'toUserId',
                match: { _id: { $ne: loggedInUserId } },
                select: '-fullName -image -gender -phoneNumber -createdAt -updatedAt -__v -_id',
            },
        ])
        if(foundConnectionArray < 1){
            return res.status(200).json({result : `No friends yet`, error:null, data: foundConnectionArray})
        }
        else{
            return res.status(200).json({result : `All friends`, error:null, data: foundConnectionArray})
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to friend list', error : err.message})
    }
})




export default connectionRouter