import { diskStorage } from "multer";
import type {Request} from 'express'
import { randomUUID } from "crypto";

export const localFileUpload = () =>{
  return{
     storage: diskStorage({
                destination: (req:Request,file:Express.Multer.File,cb:Function ) => {
                    cb(null, './uploads')
                },
                filename: (req:Request, file:Express.Multer.File, cb: Function ) => {
                    const fileName = randomUUID() + "_" +Date.now() + "_"+ file.originalname
                    cb(null, fileName)
                }
               })
  }
}