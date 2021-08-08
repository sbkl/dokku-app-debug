import { Field, ID, Int, ObjectType } from "type-graphql";

@ObjectType({
  isAbstract: true,
})
export class Image {
  @Field((_type) => ID, {
    nullable: false,
  })
  id!: string;

  @Field((_type) => String, {
    nullable: true,
  })
  imageableType?: string;

  @Field((_type) => String, {
    nullable: true,
  })
  imageableId?: string;

  @Field((_type) => String, {
    nullable: true,
  })
  name?: string;

  @Field((_type) => String, {
    nullable: true,
  })
  mimetype?: string;

  @Field((_type) => Int, {
    nullable: true,
  })
  width: number | undefined;

  @Field((_type) => Int, {
    nullable: true,
  })
  height: number | undefined;

  @Field((_type) => String, {
    nullable: true,
  })
  path?: string;

  @Field((_type) => String, {
    nullable: true,
  })
  field?: string | null;

  @Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date;
}
