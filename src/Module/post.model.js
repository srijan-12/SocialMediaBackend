import mongoose from 'mongoose'
import validator from 'validator'
import User from './user.model.js';
const postSchema = new mongoose.Schema({

    captian: {
        type : String,
        trim : true,
    },
    image : {
        type : String,
        trim : true,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error(`Invalid Image DB`);
            }
        }
    },
    likes : {
        type : [mongoose.Schema.Types.ObjectId]
    },
    comments : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Comment'
    },
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},{timestamps: true})


const Post = mongoose.model("Post", postSchema);
export default Post