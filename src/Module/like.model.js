import mongoose from 'mongoose'
import validator from 'validator'
import User from './user.model.js';
const likeSchema = new mongoose.Schema({
    LikeCreatedBy : {
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


const Like = mongoose.model("Like", likeSchema);
export default Like