import multer from "multer";
import { createBucketClient } from '@cosmicjs/sdk';

const {BUCKET_SLUG,
    READ_KEY, 
    WRITE_KEY } = process.env;

    const bucketDaniGram = createBucketClient({
        bucketSlug: BUCKET_SLUG as string,
        readKey: READ_KEY as string,
        writeKey: WRITE_KEY as string,
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
        
        if (req.url && req.url.includes("publicacao")) {
            return await bucketDaniGram.media.insertOne({
              media: media_object,
              folder: "publicacao",
            });
          } else if (req.url && req.url.includes("usuario")) {
            return await bucketDaniGram.media.insertOne({
              media: media_object,
              folder: "avatar",
            });
          } else {
            return await bucketDaniGram.media.insertOne({
              media: media_object,
              folder: "stories",
            });
          }
    }
}

export{upload, uploadImagesCosmic};