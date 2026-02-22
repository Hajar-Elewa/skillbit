import { MongooseModule } from '@nestjs/mongoose'
import { Badge, BadgeSchema } from './badge.schema'


//Model 
export const BadgeModel = MongooseModule.forFeature([
  {
    name: Badge.name,
    schema: BadgeSchema,
  },
])

//Badge type
export type TBadge = Badge & Document