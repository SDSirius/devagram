import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from "../../models/UserModel";
import { PublicacaoModel } from "../../models/PublicacaoModel";

const likesEndpoint = async(req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG | any[]>) => {
    
    try{
        if(req.method === 'PUT'){
            const {id} =req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicação Não encontrada!'});
            }

            const {userId} = req?.query;
            const usuario = await UserModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro : 'Usuário Não encontrado!'});
            }

            const indexUserOnLikes = publicacao.likes.findIndex((e:any) => e.toString() ===usuario._id.toString());

            if (indexUserOnLikes != -1){
                publicacao.likes.splice(indexUserOnLikes,1);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao descurtida com sucesso!'});
            }else{
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao curtida com sucesso!'});
            }
        }
        return res.status(405).json({erro : 'Methodo informado Invalido'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu um erro ao dar like!'});
    }
}
export default validarTokenJWT(conectarMongoDB(likesEndpoint));