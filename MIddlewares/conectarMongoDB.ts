import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import mongoose from 'mongoose';
import type { RespostaPadraoMSG } from "../types/RespostaPadraoMSG";

export const conectarMongoDB = (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMSG>) =>{
        
        if(mongoose.connections[0].readyState){
            return handler (req,res);
        }

        const {DB_CONEXAO_STRING} = process.env;
        if(!DB_CONEXAO_STRING){
            return res.status(500).json({ erro : "ENV de config do DB não informado"});
        }
        
        mongoose.connection.on('conected', () => console.log("banco de dados conctado"));
        mongoose.connection.on('error', error => console.log(`Ocorreu um erro ao se conectar no banco:${error} `));
        await mongoose.connect(DB_CONEXAO_STRING);
        return handler(req, res);
}