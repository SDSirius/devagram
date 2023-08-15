import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG'
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from '../../models/UserModel';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { politicaCORS } from "../../MIddlewares/politicaCORS";
import { FollowingModel } from "../../models/FollowingModel";

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG | any>) =>{
    try{
        if (req.method ==='GET'){
            if (req?.query?.id){
                const usuario = await UserModel.findById(req?.query?.id);
                if (!usuario){
                    return res.status(400).json({erro: 'Usuario Não encontrado!'});
                }
                const publicacoes =await PublicacaoModel
                    .find({idUsuario  : usuario._id})
                    .sort({data : -1});
                    
                return res.status(200).json(publicacoes);
            }else{
                const { userId }= req.query;
                const usuarioOn = await UserModel.findById(userId);
                if (!usuarioOn) {
                    return res.status(400).json({erro: "Usuario nao encontrado. "});
                }

                const seguidores = await FollowingModel.find({userId: usuarioOn._id});
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

                const publicacoes = await PublicacaoModel.find({
                    $or : [
                        {idUsuario : usuarioOn._id},
                        {idUsuario : seguidoresIds}
                    ]
                })
                .sort({data: -1});

                const result  = [];
                for (const publicacao of publicacoes) {
                    const usuarioDaPublicacao = await UserModel.findById(publicacao.idUsuario);
                    if(usuarioDaPublicacao){
                        const final = {...publicacao._doc, usuario : {
                            nome : usuarioDaPublicacao.nome,
                            avatar : usuarioDaPublicacao.avatar
                        }};
                        result.push(final);
                    }
                    
                }
                
                return res.status(200).json(result);
            }
        }
        return res.status(405).json({erro: 'Método informado não é valido.'});
    }catch(e){
        console.log(e);
        return res.status(400).json({erro: 'Não foi possivel Obter o feed! Erro : ' + e});
    }
}
export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));