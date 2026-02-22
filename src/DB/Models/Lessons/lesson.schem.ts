import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Lesson {

@Prop({ required: true })
title: string;                    // "Lesson 1: Introduction to OOP"

@Prop({ required: true })
description: string;              // the lesson text content

@Prop({
  type: [{
    title: { type: String, required: true },   // "Play List One"
    url: { type: String, required: true }       // YouTube or any link
  }],
  default: []
})
resources: { title: string; url: string }[];   // the links from your UI

@Prop({
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Course',
  required: true
})
courseId: mongoose.Types.ObjectId;            // which course this belongs to
}

export const LessonSchema = SchemaFactory.createForClass(Lesson)