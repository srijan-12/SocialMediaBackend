import express from 'express'
import { isLoggedIn } from '../Middlewares/isLoggedIn.js'
import Post from '../Module/post.model.js'
import Like from '../Module/like.model.js'

const likeRouter = express.Router()

likeRouter.get("/:postId", isLoggedIn, async(req,res)=>{
    try{
        const {postId} = req.params
        const foundPost = await Post.findById(postId).populate({
            path: "likes",
            select: "-postId -createdAt -updatedAt -__v",
            populate:{
                path : "LikeCreatedBy",
                select : "-fullName -gender -phoneNumber -createdAt -updatedAt -__v"
            }
        })
        if(!foundPost) throw new Error("No such post found")
        const likesArray = foundPost.likes
        if(likesArray.length < 1){
            return res.status(200).json({result : 'No likes yet', error : null, data: likesArray})
        }else{
            return res.status(200).json({result : 'showing likes', error : null, data: likesArray})
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to fetch Likes', error : err.message})
    }
})



likeRouter.post("/toggle/:postId", isLoggedIn, async(req,res)=>{
    try{
        const {postId} = req.params
        const foundPost = await Post.findById(postId)
        .select("-createdBy -createdAt -updatedAt -__v -comments -image -captain")
        .populate({
          path: 'likes', 
        //   select: '-postId -createdAt -updatedAt -__v',
        });
        if(!foundPost) throw new Error("No post found")
        const loggedInUserId = req.user._id
        console.log(foundPost)
        if(foundPost){
            // user liked => unlike => foundPost.likes filter and likes model edit
            const checkForLike = foundPost.likes.filter((l)=> loggedInUserId.equals(l.LikeCreatedBy))
            const checkForLikeId = checkForLike[0]
            if(checkForLikeId){
                await Like.findByIdAndDelete(checkForLikeId)
                const newFilteredLikesArray = foundPost.likes.filter((l)=> !l.equals(checkForLikeId))
                foundPost.likes = newFilteredLikesArray
                await foundPost.save()
                await foundPost.populate({
                    path: "likes",
                    select: "-postId -createdAt -updatedAt -__v",
                    populate:{
                        path : "LikeCreatedBy",
                        select : "-fullName -gender -phoneNumber -createdAt -updatedAt -__v"
                    }
                })
                return res.status(200).json({result : 'unliked', error : null, data: foundPost})
            }else{
                const newLikeObje = new Like({LikeCreatedBy : loggedInUserId, postId:postId})
                await newLikeObje.save()
                foundPost.likes.push(newLikeObje._id)
                await foundPost.save()
                await foundPost.populate({
                    path: "likes",
                    select: "-postId -createdAt -updatedAt -__v",
                    populate:{
                        path : "LikeCreatedBy",
                        select : "-fullName -gender -phoneNumber -createdAt -updatedAt -__v"
                    }
                })
                return res.status(200).json({result : 'liked', error : null, data: foundPost})
            }
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to like/unlike', error : err.message})
    }
})


export default likeRouter