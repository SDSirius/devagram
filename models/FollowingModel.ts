import mongoose, {Schema} from "mongoose";

const FollowingSchema = new Schema({
    myId : {type : String, required : true},
    followedUserId : {type : String, required : true}
});
export const FollowingModel = (mongoose.models.follow || mongoose.model('follow', FollowingSchema));