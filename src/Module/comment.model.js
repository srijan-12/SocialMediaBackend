import mongoose from 'mongoose'
import validator from 'validator'
import User from './user.model.js';
const commentchema = new mongoose.Schema({

    content: {
        type : String,
        trim : true,
        required : true
    },
    commentCreatedBy : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref :"Post"
    }
},{timestamps: true})


const Comment = mongoose.model("Comment", commentchema);
export default Comment