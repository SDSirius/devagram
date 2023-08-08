import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from "../../models/UserModel";
import { politicaCORS } from "../../MIddlewares/politicaCORS";
import { FollowingModel } from "../../models/FollowingModel";

const pesquisaEndpoint = async(req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG | any[]>) => {
    try{
        if(req.method === 'GET'){
            if(req?.query?.id) {
                const usuarioEncontrado = await UserModel.findById(req?.query?.id);
                if (!usuarioEncontrado){
                    return res.status(400).json({erro : 'Usuario Não encontrado'});
                }

                const user = {
                    senha:null, //
                    followingThisUser:false, // 
                    nome: usuarioEncontrado.nome, //
                    email: usuarioEncontrado.email, //
                    _id: usuarioEncontrado._id, //
                    avatar: usuarioEncontrado.avatar, // 
                    followers: usuarioEncontrado.seguidores,
                    following: usuarioEncontrado.seguindo,
                    posts: usuarioEncontrado.publicacoes, //
                } as any;
                
                const followingThisUser = await FollowingModel.find({myId: req?.query?.userId, followedUserId: usuarioEncontrado._id });
                if (followingThisUser && followingThisUser.length > 0){
                    user.followingThisUser = true;
                }

                return res.status(200).json(user);
            }else{
                const {filtro} = req.query;
                if (!filtro || filtro.length < 2){
                    return res.status(400).json({erro : 'Busca Invalida. Utilize mais caracteres'});
                }

                const usuariosEncontrados = await UserModel.find({
                    $or: [{nome : {$regex : filtro, $options : 'i'}},
                        {email : {$regex : filtro, $options : 'i'}}]
                });

                usuariosEncontrados.forEach(userFound => {
                    userFound.senha = null
                });

                return res.status(200).json(usuariosEncontrados);
            }
            
        }
        return res.status(400).json({erro : 'Metodo informado invalido'})
    }catch(e){
        console.log(e)
        return res.status(500).json({erro : ' Não foi possivel buscar usuários' + e})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));