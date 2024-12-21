import { isLoggedIn } from "../Middlewares/isLoggedIn.js";
import { sanitizeCreateComment } from "../Middlewares/sanatizeCreateComment.js";
import Comment from "../Module/comment.model.js";
import Post from "../Module/post.model.js";
import express from 'express'
const commentRouter = express.Router()

commentRouter.post("/add-comment/:postId", isLoggedIn, sanitizeCreateComment, async(req,res)=>{
    try{
        const {postId} = req.params
        const {content} = req.body
        const foundPost = await Post.findById(postId)
        if(!foundPost) throw new Error('No post found')
        const commentCreaterId = String(req.user._id)
        const newComment = new Comment({content, commentCreatedBy: commentCreaterId, postId: postId})
        await newComment.save()
        foundPost.comments.push(newComment._id)
        await foundPost.save()
        return res.status(200).json({result : 'comment added', error : null, data: newComment})
    }catch(err){
        return res.status(400).json({result : 'Failed to post comment', error : err.message})
    }
})



commentRouter.patch("/:commentId", isLoggedIn, sanitizeCreateComment, async(req,res)=>{
    try{
        const{commentId} = req.params
        const {content} = req.body
        const loggedInUserId = String(req.user?._id)
        const foundComment = await Comment.findById(commentId)
        if(!foundComment) throw new Error('No such comment')
        const commentCreaterId = String(foundComment.commentCreatedBy)
        if(loggedInUserId === commentCreaterId){
            foundComment.content = content
            await foundComment.save()
            return res.status(200).json({result : 'comment updated', error : null, data: foundComment})
        }else{
            throw new Error('un-authorised to modify this comment')
        }  
    }catch(err){
        return res.status(400).json({result : 'Failed to update comment', error : err.message})
    }
})


//who can delete => post owner and comment creater
commentRouter.delete("/:commentId", isLoggedIn, async(req,res)=>{
    try{
        const{commentId} = req.params
        const loggedInUserId = String(req.user?._id)
        const foundComment = await Comment.findById(commentId)
        if(!foundComment) throw new Error('No such comment')
        const commentCreaterId = String(foundComment.commentCreatedBy)
        const postId = String(foundComment.postId)
        const foundPost = await Post.findById(postId)
        if(!foundPost) throw new Error('No such post')
        const foundPostOwnerId = String(foundPost.createdBy)
        if(commentCreaterId === loggedInUserId || foundPostOwnerId === loggedInUserId){
            await Comment.findByIdAndDelete(commentId)
            return res.status(200).json({result : 'comment deleted', error : null, data: null})
        }else{
            throw new Error('un-authorised to delete this comment')
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to delete comment', error : err.message})
    }
})


commentRouter.get("/:postId", isLoggedIn, async(req,res)=>{
    try{
        const{postId} = req.params
        const foundPost = await Post.findById(postId).populate({ path: "comments",
            select: "-postId -createdAt -updatedAt -__v" ,
            populate : {
                    path: "commentCreatedBy",
                    select: "-fullName -password -__v -gender -phoneNumber -tokens -createdAt -updatedAt"
            }
        })
        if(!foundPost) throw new Error('No such Post')
        const commentsArray = foundPost.comments
        if(commentsArray.length < 1) return res.status(200).json({result : 'No comments yet', error : null, data: commentsArray})
        else{
            return res.status(200).json({result : 'all comments', error : null, data: foundPost})
    }
    }catch(err){
        return res.status(400).json({result : 'Failed to fetch comment', error : err.message})
    }
})



export default commentRouter