import mongoose from "mongoose";
const connectionString = 'mongodb+srv://srijan122001:xtK4oshl7cpIQyKU@srijan.6nhyh.mongodb.net/SocialMedia'

export default async function connectToDB(){
    await mongoose.connect(connectionString)
}