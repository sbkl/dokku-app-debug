import { Field, ID, Int, ObjectType } from "type-graphql";
import { Section } from "./Section";

@ObjectType({
  isAbstract: true,
})
export class Item {
  @Field((_type) => ID, {
    nullable: false,
  })
  id!: string;

  @Field((_type) => String, {
    nullable: true,
  })
  name?: string;

  @Field((_type) => String, {
    nullable: true,
  })
  description?: string;

  @Field((_type) => Int, {
    nullable: true,
  })
  price?: number;

  @Field((_type) => Int, {
    nullable: false,
  })
  sort: number;

  section?: Section;

  @Field((_type) => String, {
    nullable: true,
  })
  sectionId?: string;

  @Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date;
}
