import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from "../../models/UserModel";
import nc from 'next-connect';
import {upload, uploadImagesCosmic} from '../../services/uploadImagesCosmic';
import { politicaCORS } from "../../MIddlewares/politicaCORS";

const handler = nc ()
    .use(upload.single('file'))
    .put(async(req: any, res: NextApiResponse<RespostaPadraoMSG>) =>{
        try{
            const {userId} = req?.query;
            const usuario = await UserModel.findById(userId);

            if (!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado'});
            }

            const {nome} = req?.body;
            if(nome || nome.length > 2){
                usuario.nome = nome;
            }
            const {file} = req;
            if (file && file.originalname){
                const image = await uploadImagesCosmic(req);
                if(image && image.media && image.media.url){
                    usuario.avatar = image.media.url;
                }
            }
            await UserModel.findByIdAndUpdate({_id : usuario._id}, usuario);

            return res.status(200).json({msg : 'Usuário Atualizado'});
        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Nao foi possivel atualizar o usuario ' + e});
        }
    })
    .get(async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG | any>) => {
        try{
            const {userId} = req?.query;
            const usuario = await UserModel.findById(userId);
            usuario.senha = null;
            return res.status(200).json(usuario);
        }catch(e){
            console.log(e);
        }
        return res.status(400).json({erro : `Não foi possivel obter dados do usuário!`});      
    });

export const config = {
    api : {
        bodyParser : false
    }
}    
export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));