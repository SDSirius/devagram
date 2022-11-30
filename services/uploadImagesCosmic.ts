import multer from "multer";
import cosmicjs from 'cosmicjs';

const {CHAVE_GRAVACAO_AVATARES,
    CHAVE_GRAVACAO_PUBLICACOES, 
    BUCKETS_AVATARES,
    BUCKETS_PUBLICACOES } = process.env;

const Cosmic = cosmicjs()
const bucketAvatares = Cosmic.bucket({
    slug : BUCKETS_AVATARES,
    write_key : CHAVE_GRAVACAO_AVATARES
});

const bucketPublicacoes = Cosmic.bucket({
    slug : BUCKETS_PUBLICACOES,
    write_key : CHAVE_GRAVACAO_PUBLICACOES
});

const storage = multer.memoryStorage();
const upload = multer({storage : storage});

const uploadImagesCosmic = async(req : any) =>{
    if (req?.file?.originalname){
        
        if(!req.file.originalname.includes('.png') &&
        !req.file.originalname.includes('.jpg') &&
        !req.file.originalname.includes('.jpeg')){
            throw new Error('Extensão da imagem invalida(usar png, jpg ou jpeg)');
        }

        const media_object = {
            originalname: req.file.originalname,
            buffer : req.file.buffer
        }
        
        if (req.url && req.url.includes('publicacao')){
            return await bucketPublicacoes.addMedia({media : media_object});
        }else{
            return await bucketAvatares.addMedia({media : media_object});
        }
    }
}

export{upload, uploadImagesCosmic};