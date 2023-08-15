import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG'
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { PublicacaoModel } from "../../models/PublicacaoModel";
import { UserModel } from '../../models/UserModel';
import { politicaCORS } from "../../MIddlewares/politicaCORS";

const commentEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) =>{
    try{
        if(req.method === 'PUT'){
            const {userId, id} = req.query;
            const usuarioLogado = await UserModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário nao encontrado'});
            }
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicação nao encontrada'});
            }

            if(!req.body || !req.body.comentario || req.body.comentario.length < 2){
                return res.status(400).json({erro : 'Comentário Invalido!'});
            }
            const comentario = {
                idUser : usuarioLogado._id,
                nome : usuarioLogado.nome,
                comentario : req.body.comentario
            }
            publicacao.comentarios.push(comentario);
            await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id }, publicacao);
            return res.status(200).json({msg : 'Comentario adicionado com sucesso'});
        }
        return res.status(405).json({erro : 'Método informado não é valido!'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possivel Comentar na publicação! Erro: ' + e});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(commentEndpoint)));