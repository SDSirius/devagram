import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMSG } from "../types/RespostaPadraoMSG";
import NextCors from 'nextjs-cors';

export const politicaCORS = (handler : NextApiHandler) =>
async(req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) =>{
        try{

            await NextCors(req,res, {
                origin : '*',
                methods : ['GET', 'POST', 'PUT'],
                optionsSuccessStatus : 200,
            });

            return handler(req,res);

        }catch(e){
            console.log('Erro ao tratar a politica de CORS: '+ e);
            return res.status(500).json({erro : 'Erro ao tratar a politica de CORS'});

        }
    }