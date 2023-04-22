import type {NextApiRequest, NextApiResponse} from 'next';
import { conectarMongoDB } from '../../MIddlewares/conectarMongoDB';
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import type { LoginResposta } from '../../types/LoginResposta';
import md5 from 'md5';
import { UserModel } from '../../models/UserModel';
import jwt from 'jsonwebtoken';
import { politicaCORS } from "../../MIddlewares/politicaCORS";


const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMSG | LoginResposta>
 ) => {

    const {MINHA_CHAVE_JWT}  = process.env;
    if (!MINHA_CHAVE_JWT){
        return res.status(500).json({erro: 'ENV JWT Não informada!'});
    }

    if (req.method === 'POST'){
        const {login, senha} = req.body;

        const usersFound = await UserModel.find({email : login, senha: md5(senha)});
        
        if (usersFound && usersFound.length > 0){
            const userFound = usersFound[0];
            
            const token = jwt.sign({_id : userFound._id}, MINHA_CHAVE_JWT);

            return res.status(200).json({
                nome : userFound.nome,
                email : userFound.email,
                token});
        }
        return res.status(400).json({erro : 'Login ou senha inválidos'});
    }
    return res.status(405).json({erro : 'Você não tem permissão para isso no momento!'});
}
export default politicaCORS(conectarMongoDB(endpointLogin));