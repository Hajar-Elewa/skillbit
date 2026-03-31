import { Injectable } from "@nestjs/common";
import { DBService } from "../abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Favorite } from "./favorite.schema";


@Injectable() 
export class FavoriteRepo extends DBService<Favorite> {
  constructor(@InjectModel(Favorite.name) private favoriteModel: Model<Favorite>) {
    super(favoriteModel)
  }

}