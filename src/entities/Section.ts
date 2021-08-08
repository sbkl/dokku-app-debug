import { Field, ID, Int, ObjectType } from "type-graphql";
import { Item } from "./Item";
import { Menu } from "./Menu";

@ObjectType({
  isAbstract: true,
})
export class Section {
  @Field((_type) => ID, {
    nullable: false,
  })
  id!: string;

  @Field((_type) => String, {
    nullable: false,
  })
  name: string;

  menu?: Menu;

  @Field((_type) => String, {
    nullable: true,
  })
  menuId?: string;

  items?: Item[];

  @Field((_type) => Int, {
    nullable: false,
  })
  sort: number;

  @Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date;
}
