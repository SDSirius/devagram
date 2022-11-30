import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from "../../types/RespostaPadraoMSG";
import type { CadastroRequisicao } from "../../types/CadastroRequisiao";
import {UserModel} from '../../models/UserModel';
import {conectarMongoDB} from '../../MIddlewares/conectarMongoDB'
import md5 from 'md5';
import {upload, uploadImagesCosmic} from '../../services/uploadImagesCosmic'
import nc from 'next-connect'

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) => {

        const usuario = req.body as CadastroRequisicao;

        if(!usuario.nome || usuario.nome.length < 2){
            return res.status(400).json({erro : 'Nome Inválido'});
        }
        if(!usuario.email || usuario.email.length < 5
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')){
            return res.status(400).json({erro : 'E-mail Inválido'});
        }
        if(!usuario.senha || usuario.senha.length < 8){
            return res.status(400).json({erro : 'Senha Inválida'});
        }
        
        const image = await uploadImagesCosmic(req);

        const userToBeSaved = {
            nome : usuario.nome,
            email : usuario.email,
            senha : md5(usuario.senha),
            avatar : image.media.url
        }

        const userSameEmail = await UserModel.find({email : usuario.email});
        if(userSameEmail && userSameEmail.length > 0){
            return res.status(400).json({erro : 'E-mail ja cadastrado!'})
        }

        await UserModel.create(userToBeSaved);
        return res.status(200).json({msg : 'Usuário criado com sucesso!'});
    
})

export const config ={
    api:{
        bodyParser : false
    }
}

export default conectarMongoDB(handler);