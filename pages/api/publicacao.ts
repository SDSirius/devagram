import type { NextApiResponse } from "next";
import type { RespostaPadraoMSG } from "../../types/RespostaPadraoMSG";
import nc from 'next-connect';
import { upload, uploadImagesCosmic } from '../../services/uploadImagesCosmic';
import { conectarMongoDB } from '../../MIddlewares/conectarMongoDB';
import { validarTokenJWT } from '../../MIddlewares/validarTokenJWT';
import { UserModel } from '../../models/UserModel';
import { PublicacaoModel} from '../../models/PublicacaoModel';
import { politicaCORS } from "../../MIddlewares/politicaCORS";

const handler = nc()
    .use(upload.single('file'))
    .post( async (req : any, res : NextApiResponse<RespostaPadraoMSG> ) =>{
        try{
            const {userId} = req.query;
            const usuario = await UserModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado!'});
            }

            if (!req || !req.body){
                return res.status(400).json({erro : 'Parametros de entrada nao informado!'});
            }
            const {descricao} = req?.body;
            
            if(!descricao || descricao.length < 2){
                return res.status(400).json({erro : 'Mensagem muito curta'});
            }

            if(!req.file || !req.file.originalname){
                return res.status(400).json({erro : 'imagem Obrigatória'});
            }

            const image = await uploadImagesCosmic(req);
            const publicacao = {
                idUser : usuario._id,
                descricao,
                foto : image.media.url,
                data : new Date()
            }

            usuario.publicacoes++;
            await UserModel.findByIdAndUpdate({_id : usuario._id }, usuario);

            await PublicacaoModel.create(publicacao);
            return res.status(200).json({msg : 'Publicação Enviada com sucesso!'});
        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Erro ao cadastrar publicacao!'});
        }
});

export const config = {
    api : {
        bodyParser : false
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));