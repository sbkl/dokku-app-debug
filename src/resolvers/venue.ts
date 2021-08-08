import {
  Arg,
  Args,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
} from "type-graphql";
import { Venue, Menu, Image } from "../entities";
import { MyContext } from "src/types";
import { Imageable } from "./image";
import { uploadStream } from "../lib/cloudinary";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Topic } from "./topics";
import { VenueUpdatedArgs } from "./venue.resolver.args";
import { VenueUpdatedPayload } from "./venueUpdated.interface";

@InputType()
class VenueInput {
  @Field()
  id: string;
  @Field(() => String, { nullable: true })
  name: string | null;
  @Field(() => String, { nullable: true })
  description: string | null;
  @Field(() => String, { nullable: true })
  currency: string | null;
}

@Resolver(() => Venue)
export class VenueResolver {
  @FieldResolver(() => Image, { nullable: true })
  async coverImage(
    @Root() venue: Venue,
    @Ctx() { prisma }: MyContext
  ): Promise<Image | null> {
    return await prisma.image.findFirst({
      where: {
        imageableId: { equals: venue.id },
        AND: {
          field: { equals: "cover" },
          AND: { imageableType: { equals: "Venue" } },
        },
      },
    });
  }

  @FieldResolver(() => Image, { nullable: true })
  async logoImage(
    @Root() venue: Venue,
    @Ctx() { prisma }: MyContext
  ): Promise<Image | null> {
    return await prisma.image.findFirst({
      where: {
        imageableId: { equals: venue.id },
        AND: {
          field: { equals: "logo" },
          AND: { imageableType: { equals: "Venue" } },
        },
      },
    });
  }

  @FieldResolver(() => Menu, { nullable: true })
  async menu(
    @Root() venue: Venue,
    @Ctx() { prisma }: MyContext
  ): Promise<Menu | null> {
    return prisma.menu.findFirst({
      where: {
        venueId: { equals: venue.id },
        AND: { default: { equals: true } },
      },
    });
  }

  @Query((_type) => Venue, { nullable: true })
  async venue(
    @Arg("id", (_type) => ID!) id: string,
    @Ctx() { prisma }: MyContext
  ): Promise<Venue | null> {
    return await prisma.venue.findFirst({ where: { id } });
  }

  @Mutation(() => Venue)
  async createOrUpdateVenue(
    @Arg("data") { id, ...values }: VenueInput,
    @Ctx() { prisma }: MyContext
  ): Promise<Venue> {
    return await prisma.venue.upsert({
      where: { id },
      update: { ...values },
      create: {
        ...values,
        menus: {
          create: {},
        },
      },
    });
  }

  @Subscription(() => Venue, {
    topics: Topic.VenueUpdated,
    nullable: true,
    filter: ({
      payload,
      args,
    }: ResolverFilterData<VenueUpdatedPayload, VenueUpdatedArgs>) => {
      return payload.venue.id === args.venueId;
    },
  })
  venueUpdated(
    @Root() { venue }: VenueUpdatedPayload,
    @Args() { venueId }: VenueUpdatedArgs
  ): Venue | null {
    if (venueId) {
      return venue;
    }
    return null;
  }

  @Mutation(() => Boolean)
  async updateVenueAttribute(
    @Arg("id", (_type) => ID!) id: string,
    @Arg("attribute") attribute: string,
    @Arg("value") value: string,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ) {
    try {
      const venue = await prisma.venue.update({
        where: { id },
        data: {
          [attribute]: value,
        },
      });
      await notifyVenueUpdate({ venue });
      return true;
    } catch (e) {
      return false;
    }
  }

  @Mutation(() => Image)
  async updateVenueImage(
    @Arg("imageId", (_type) => ID!) imageId: string,
    @Arg("file", () => GraphQLUpload) file: FileUpload,
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
      const venue = await prisma.venue.findFirst({
        where: { id: { equals: imageable.imageableId } },
      });

      if (venue) {
        await notifyVenueUpdate({ venue });
      }
      return image;
    } catch (e) {
      return null;
    }
  }
}
