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
                    .find({idUser : usuario._id})
                    .sort({data : -1});
                    
                return res.status(200).json(publicacoes);
            }else{
                const { userId }= req.query;
                const usuarioOn = await UserModel.findById(userId);
                if (!usuarioOn) {
                    return res.status(400).json({erro: "Usuario nao encontrado. "});
                }

                const following = await FollowingModel.find({usuarioId: usuarioOn._id});
                const followingIds = following.map(f => f.followedUserId);

                const publicacoes = await PublicacaoModel.find({
                    $or: [ 
                        {idUser : usuarioOn._id},
                        {idUser : followingIds}                        
                    ]
                })
                .sort({data: -1});

                const resul = [];
                for (const publicacao of publicacoes) {
                    const userPublicat = await UserModel.findById(publicacao.idUser);
                    if(userPublicat){
                        const ultVar = {...publicacao._doc, usuario : {
                            nome : userPublicat.nome,
                            avatar : userPublicat.avatar
                        }};
                        resul.push(ultVar);
                    }
                    
                }
                
                return res.status(200).json(resul);
            }
        }
        return res.status(405).json({erro: 'Método informado não é valido.'});
    }catch(e){
        console.log(e);
        return res.status(400).json({erro: 'Não foi possivel Obter o feed! Erro : ' + e});
    }
}
export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));