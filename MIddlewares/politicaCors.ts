import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMSG } from "../types/RespostaPadraoMSG";

export const politicaCors = async (handler : NextApiHandler) =>
    (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) =>{

    }