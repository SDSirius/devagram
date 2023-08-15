import mongoose, {Schema} from "mongoose";

const FollowingSchema = new Schema({
    idUsuario : {type : String, required : true},
    usuarioSeguidoId : {type : String, required : true}
});
export const FollowingModel = (mongoose.models.follow || mongoose.model('follow', FollowingSchema));