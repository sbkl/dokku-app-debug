import { Field, ID, ObjectType } from "type-graphql";
import { Section } from "./Section";
import { Venue } from "./Venue";

@ObjectType({
  isAbstract: true,
})
export class Menu {
  @Field((_type) => ID, {
    nullable: false,
  })
  id!: string;

  venue?: Venue;

  @Field((_type) => String, {
    nullable: true,
  })
  venueId!: string;

  sections?: Section[];

  @Field((_type) => Boolean, {
    nullable: true,
  })
  default!: boolean;

  @Field((_type) => Date, {
    nullable: true,
  })
  createdAt: Date;

  @Field((_type) => Date, {
    nullable: true,
  })
  updatedAt: Date;
}
