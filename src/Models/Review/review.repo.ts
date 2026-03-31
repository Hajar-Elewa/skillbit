import { Injectable } from "@nestjs/common";
import { DBService } from "../abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Review } from "./review.schema";


@Injectable() 
export class ReviewRepo extends DBService<Review> {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {
    super(reviewModel)
  }

}