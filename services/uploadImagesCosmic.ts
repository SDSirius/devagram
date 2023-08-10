import multer from "multer";
import { createBucketClient } from '@cosmicjs/sdk';

const {BUCKET_SLUG,
    READ_KEY, 
    WRITE_KEY } = process.env;

    const bucketdanigram = createBucketClient({
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
          buffer: req.file.buffer,
        };
        // const media_object = req.files[0];
        if (req.url && req.url.includes("publicacao")) {
          return await bucketdanigram.media.insertOne({
            media: media_object,
            folder: "publicacao",
          });

          } else {
            return await bucketdanigram.media.insertOne({
              media: media_object,
              folder: "avatar",
            });
          }
    }
};

export{upload, uploadImagesCosmic};