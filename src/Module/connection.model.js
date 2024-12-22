import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    status : {
        type : String,
        required : true,
        enum : {
            values : ["ignored", "interested", "accepted", "rejected"],
            message : `{VALUES} is of incorrect status type`
        }
    }
},{
    timestamps : true
})


connectionSchema.index({fromUserId: 1, toUserId: 1});

connectionSchema.pre("save", function(next){
    const connection = this;
    if(connection.fromUserId.equals(connection.toUserId)){
        throw new Error(`You cannot send request to yourself`);
    }
    next();
})


const Connection = mongoose.model("Connection", connectionSchema);
export default Connection