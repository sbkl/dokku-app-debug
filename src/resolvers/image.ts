import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Image } from "../entities";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  Resolver,
} from "type-graphql";

import { uploadStream } from "../lib/cloudinary";

@InputType()
export class Imageable {
  @Field()
  imageableType: string;
  @Field((_type) => ID!)
  imageableId: string;
  @Field((_type) => String, { nullable: true })
  field?: string | null;
}

@InputType()
export class ImageInput {
  @Field(() => ID!)
  id: string;
  @Field(() => String!)
  path: String;
}

@Resolver()
export class ImageResolver {
  @Mutation(() => Image)
  async createOrUpdateImage(
    @Arg("imageId", (_type) => ID!) id: string,
    @Arg("file", () => GraphQLUpload) file: FileUpload,
    @Arg("imageable") imageable: Imageable,
    @Ctx() { prisma }: MyContext
  ): Promise<Image | null> {
    const { createReadStream, filename: name, mimetype } = await file;

    let {
      secure_url: path,
      width,
      height,
    } = await uploadStream(createReadStream);

    return prisma.image.upsert({
      where: { id },
      update: { name, mimetype, path },
      create: { ...imageable, name, mimetype, path, width, height },
    });
  }
}
