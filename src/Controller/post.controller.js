import express from "express";
import { isLoggedIn } from "../Middlewares/isLoggedIn.js";
import { sanitizeCreatePost } from "../Middlewares/sanatizeCreatePost.js";
import Post from "../Module/post.model.js";
import { postOwnerCheck } from "../Middlewares/postOwnerCheck.js";
const postRouter = express.Router()



postRouter.post("/create-post", isLoggedIn, sanitizeCreatePost, async(req,res)=>{
    try{
        const {captian, image} = req.body
        const loggedInUserId = req.user._id
        const postObj = new Post({captian, image, createdBy: loggedInUserId})
        await postObj.save()
        return res.status(200).json({result : 'post created', error : null, data: postObj})
    }catch(err){
        return res.status(400).json({result : 'Failed to create post', error : err.message})
    }
})



postRouter.get("/all-posts/feed", isLoggedIn, async(req,res)=>{
    try{
        console.log('this is getting hit')
        const foundPosts = await Post.find({})
        console.log(foundPosts)
        if(!foundPosts.length > 0) throw new Error('No more posts to show')
        return res.status(200).json({result : 'posts retrived', error : null, data: foundPosts})
    }catch(err){
        return res.status(400).json({result : 'Failed to fetch all posts', error : err.message})
    }
})


postRouter.get("/:postId", isLoggedIn, async(req,res)=>{
    try{
        const {postId} = req.params
        const foundPost = await Post.findById(postId)
        if(!foundPost) throw new Error('No such post to delete')
        return res.status(200).json({result : 'post fetched', error : null, data: foundPost})
    }catch(err){
        return res.status(400).json({result : 'Failed to fetch post', error : err.message})
    }
})

postRouter.delete("/:postId", isLoggedIn, postOwnerCheck, async(req,res)=>{
    try{
        const {postId} = req.params
        const foundPost = await Post.findByIdAndDelete(postId)
        if(!foundPost) throw new Error('No such post to delete')
        return res.status(200).json({result : 'post deleted', error : null, data: null})
    }catch(err){
        return res.status(400).json({result : 'Failed to delete post', error : err.message})
    }
})


postRouter.patch("/:postId", isLoggedIn, postOwnerCheck,sanitizeCreatePost, async(req,res)=>{
    try{
        const {postId} = req.params
        const {captian, image} = req.body
        const foundPost = await Post.findByIdAndUpdate(postId, {captian, image}, {new:true})
        if(!foundPost) throw new Error('No such post to update')
        return res.status(200).json({result : 'post updated', error : null, data: foundPost})
    }catch(err){
        return res.status(400).json({result : 'Failed to update post', error : err.message})
    }
})


export default postRouter