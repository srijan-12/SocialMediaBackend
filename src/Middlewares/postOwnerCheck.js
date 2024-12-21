import Post from "../Module/post.model.js"

export const postOwnerCheck = async(req,res,next) =>{
    try{
        const loggedInUserId = String(req.user._id)
        const {postId} = req.params
        // console.log(postId)
        const foundPost = await Post.findById(postId)
        if(!foundPost) throw new Error("No post to delete/upadte")
        const foundPostCreatedBy = String(foundPost?.createdBy)
        // console.log(loggedInUserId)
        // console.log(foundPostCreatedBy)
        if(loggedInUserId === foundPostCreatedBy) next()
        else{
            throw new Error("Un-authorized")
        }
    }catch(err){
        return res.status(400).json({result : 'Failed to delete/upadte post', error : err.message})
    }

}