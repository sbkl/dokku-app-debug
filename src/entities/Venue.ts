import { Menu } from "./Menu";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType({
  isAbstract: true,
})
export class Venue {
  @Field((_type) => ID, {
    nullable: false,
  })
  id!: string;

  @Field((_type) => String, {
    nullable: true,
  })
  name?: string | null;

  menus?: Menu[];

  @Field((_type) => String, {
    nullable: true,
  })
  description?: string | null;

  @Field((_type) => String, {
    nullable: true,
  })
  currency?: string | null;

  @Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date;
}
