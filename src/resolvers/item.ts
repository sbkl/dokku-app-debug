import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Publisher,
  PubSub,
  Resolver,
  Root,
} from "type-graphql";
import { Item, Image } from "../entities";
import { MyContext } from "src/types";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Imageable } from "./image";
import { uploadStream } from "../lib/cloudinary";
import { Topic } from "./topics";
import { VenueUpdatedPayload } from "./venueUpdated.interface";

@Resolver(() => Item)
export class ItemResolver {
  @FieldResolver(() => Image, { nullable: true })
  async image(
    @Root() item: Item,
    @Ctx() { prisma }: MyContext
  ): Promise<Image | null> {
    return await prisma.image.findFirst({
      where: {
        imageableId: { equals: item.id },
        AND: { imageableType: { equals: "Item" } },
      },
    });
  }
  @Mutation(() => Item)
  async createItem(
    @Arg("sectionId", () => ID) sectionId: string,
    @Ctx() { prisma }: MyContext
  ): Promise<Item> {
    const lastItem = await prisma.item.findFirst({
      where: {
        sectionId,
      },
      orderBy: { sort: "desc" },
    });
    const sort = lastItem ? lastItem?.sort + 1 : 1;

    return await prisma.item.create({
      data: {
        sectionId,
        name: "",
        description: "",
        price: 0,
        sort,
      },
    });
  }

  @Mutation(() => Boolean)
  async updateItemAttribute(
    @Arg("id", (_type) => ID!) id: string,
    @Arg("attribute") attribute: string,
    @Arg("value") value: string,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ) {
    try {
      const item = await prisma.item.update({
        where: { id },
        data: {
          [attribute]: attribute === "price" ? parseInt(value) : value,
        },
        include: {
          section: {
            include: {
              menu: true,
            },
          },
        },
      });

      const venue = await prisma.venue.findFirst({
        where: { id: { equals: item?.section.menu.venueId } },
      });
      if (venue) {
        await notifyVenueUpdate({ venue });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async moveItem(
    @Arg("itemId", () => ID) itemId: string,
    @Arg("sideItemId", () => ID) sideItemId: string,
    @Arg("direction", () => Int) direction: number,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ) {
    try {
      const sideItem = await prisma.item.update({
        where: { id: sideItemId },
        data: {
          sort: {
            decrement: direction,
          },
        },
      });

      const item = await prisma.item.update({
        where: { id: itemId },
        data: {
          sort: sideItem.sort + direction,
        },
        include: { section: { include: { menu: true } } },
      });

      const venue = await prisma.venue.findFirst({
        where: { id: { equals: item.section.menu.venueId } },
      });
      if (venue) {
        await notifyVenueUpdate({ venue });
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Image)
  async updateItemImage(
    @Arg("imageId", (_type) => ID!) imageId: string,
    @Arg("file", (_type) => GraphQLUpload) file: FileUpload,
    @Arg("imageable") imageable: Imageable,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ): Promise<Image | null> {
    try {
      const { createReadStream, filename: name, mimetype } = await file;
      let {
        secure_url: path,
        width,
        height,
      } = await uploadStream(createReadStream);

      const image = await prisma.image.upsert({
        where: { id: imageId },
        update: { name, mimetype, path, width, height },
        create: { ...imageable, name, mimetype, path, width, height },
      });
      const item = await prisma.item.findFirst({
        where: { id: { equals: imageable.imageableId } },
        include: { section: { include: { menu: true } } },
      });
      const venue = await prisma.venue.findFirst({
        where: { id: { equals: item?.section.menu.venueId } },
      });
      if (venue) {
        await notifyVenueUpdate({ venue });
      }
      return image;
    } catch (e) {
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deleteItem(
    @Arg("itemId", () => ID) itemId: string,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ): Promise<boolean> {
    try {
      const deleteImages = prisma.image.deleteMany({
        where: {
          imageableType: "Item",
          imageableId: itemId,
        },
      });

      const deleteItem = prisma.item.delete({
        where: { id: itemId },
        include: {
          section: {
            include: { menu: true },
          },
        },
      });

      const transaction = await prisma.$transaction([deleteImages, deleteItem]);

      const [
        ,
        {
          section: { menu },
        },
      ] = transaction;

      const venue = await prisma.venue.findFirst({
        where: { id: { equals: menu.venueId } },
      });

      if (venue) {
        await notifyVenueUpdate({ venue });
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
