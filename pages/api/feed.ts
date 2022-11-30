import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG'
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from '../../models/UserModel';
import { PublicacaoModel } from '../../models/PublicacaoModel';

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG | any>) =>{
    try{
        if (req.method ==='GET'){
            if (req?.query?.id){
                const usuario = await UserModel.findById(req?.query?.id);
                if (!usuario){
                    return res.status(400).json({erro: 'Usuario Não encontrado!'});
                }
                const publicacoes =await PublicacaoModel
                    .find({idUsuario : usuario._id})
                    .sort({data : -1});
                    
                return res.status(200).json(publicacoes);
            }
        }
        return res.status(405).json({erro: 'Método informado não é valido.'});
    }catch(e){
        console.log(e);
        return res.status(400).json({erro: 'Não foi possivel Obter o feed! Erro : ' + e});
    }
}
export default validarTokenJWT(conectarMongoDB(feedEndpoint));