import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from "../../models/UserModel";
import { FollowingModel } from "../../models/FollowingModel";
import { politicaCORS } from "../../MIddlewares/politicaCORS";

const followEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) => {

    try{
        if(req.method ==='PUT'){

            const {userId, id} = req?.query;
            const usuarioLogado = await UserModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Login de usuário nao reconhecido'});    
            }

            const usuarioASerSeguido = await UserModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuário destino nao reconhecido'});
            }

            const euJaSigoEsseUsuario = await FollowingModel.find({idUsuario : usuarioLogado._id, 
                usuarioSeguidoId : usuarioASerSeguido._id});

            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                //verificar se esta seguindo no DB
                euJaSigoEsseUsuario.forEach( async( e : any) => await FollowingModel
                .findByIdAndDelete({_id : e._id}));

                usuarioLogado.seguindo--;
                await UserModel.findByIdAndUpdate({_id : usuarioLogado._id }, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UserModel.findByIdAndUpdate({_id : usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({msg : 'Unfollow com Sucesso'});

            }else{

                const seguidor = {
                    idUsuario : usuarioLogado._id, 
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                
                await FollowingModel.create(seguidor);

                usuarioLogado.seguindo++;
                await UserModel.findByIdAndUpdate({_id : usuarioLogado._id }, usuarioLogado);

                usuarioASerSeguido.seguidores++;
                await UserModel.findByIdAndUpdate({_id : usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({msg : 'Follow Com Sucesso'});
            }
            
        }
        return res.status(405).json({erro : 'Metodo não permitido!'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possivel dar Follow/Unfollow' + e});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(followEndpoint)));