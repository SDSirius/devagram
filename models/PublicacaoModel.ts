import mongoose, {Schema} from "mongoose";

const PublicacaoSchema = new Schema({
    idUsuario : {type : String, requred : true},
    descricao : {type : String, requred : true},
    foto : {type : String, requred : true},
    data : {type : Date,  required : true},
    comentarios : {type : Array,  required : true, default : []},
    likes : {type : Array ,  required : true, default : []}
});

export const PublicacaoModel = (mongoose.models.publicacoes ||
    mongoose.model('publicacoes', PublicacaoSchema));