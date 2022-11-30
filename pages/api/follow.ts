import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMSG } from '../../types/RespostaPadraoMSG';
import { validarTokenJWT } from "../../MIddlewares/validarTokenJWT";
import { conectarMongoDB } from "../../MIddlewares/conectarMongoDB";
import { UserModel } from "../../models/UserModel";
import { FollowingModel } from "../../models/FollowingModel";


const followEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMSG>) => {

    try{
        if(req.method ==='PUT'){

            const {userId, id} = req?.query;
            const loggedUser = await UserModel.findById(userId);
            if(!loggedUser){
                return res.status(400).json({erro : 'Login de usuário nao reconhecido'});    
            }

            const userToBeFollowed = await UserModel.findById(id);
            if(!userToBeFollowed){
                return res.status(400).json({erro : 'Usuário destino nao reconhecido'});
            }

            const alreadyFollowing = await FollowingModel.find({myId : loggedUser._id, 
                followedUserId : userToBeFollowed._id});

            if(alreadyFollowing && alreadyFollowing.length > 0){
                //verificar se esta seguindo no DB
                alreadyFollowing.forEach( async( e : any) => await FollowingModel
                .findByIdAndDelete({_id : e._id}));

                loggedUser.seguindo--;
                await UserModel.findByIdAndUpdate({_id : loggedUser._id }, loggedUser);

                userToBeFollowed.seguidores--;
                await UserModel.findByIdAndUpdate({_id : userToBeFollowed._id }, userToBeFollowed);

                return res.status(200).json({msg : 'Unfollow com Sucesso'});

            }else{

                const follower = {
                    myId : loggedUser._id, 
                    followedUserId : userToBeFollowed._id
                };
                
                await FollowingModel.create(follower);

                loggedUser.seguindo++;
                await UserModel.findByIdAndUpdate({_id : loggedUser._id }, loggedUser);

                userToBeFollowed.seguidores++;
                await UserModel.findByIdAndUpdate({_id : userToBeFollowed._id }, userToBeFollowed);

                return res.status(200).json({msg : 'Follow Com Sucesso'});
            }
            
        }
        return res.status(405).json({erro : 'Metodo não permitido!'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possivel dar Follow/Unfollow' + e});
    }
}

export default validarTokenJWT(conectarMongoDB(followEndpoint));