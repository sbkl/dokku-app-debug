import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Int,
  Mutation,
  Publisher,
  PubSub,
  Resolver,
  Root,
} from "type-graphql";
import { Item, Section } from "../entities";
import { MyContext } from "src/types";
import { Prisma, PrismaPromise } from "@prisma/client";
import { Topic } from "./topics";
import { VenueUpdatedPayload } from "./venueUpdated.interface";

@InputType()
class SectionInput {
  @Field()
  id: string;
  @Field()
  menuId: string;
  @Field()
  name: string;
  @Field()
  sort: number;
}

@Resolver(() => Section)
export class SectionResolver {
  @FieldResolver((_type) => [Item])
  async items(
    @Root() section: Section,
    @Ctx() { prisma }: MyContext
  ): Promise<Item[]> {
    return prisma.item.findMany({
      where: {
        sectionId: section.id,
      },
      orderBy: { sort: "asc" },
    });
  }

  @Mutation(() => Section)
  async createOrUpdateSection(
    @Arg("data") { id, sort, menuId, ...args }: SectionInput,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ): Promise<Section> {
    if (id === "") {
      const lastSection = await prisma.section.findFirst({
        where: {
          menuId,
        },
        orderBy: { sort: "desc" },
      });
      sort = lastSection ? lastSection?.sort + 1 : sort;
    }

    const section = await prisma.section.upsert({
      where: { id },
      update: { menuId, sort, ...args },
      create: { menuId, sort, ...args },
      include: {
        menu: true,
      },
    });

    if (id === "") {
      await prisma.item.create({
        data: {
          sectionId: section.id,
          name: "",
          description: "",
          price: 0,
          sort: 1,
        },
      });
    }

    const venue = await prisma.venue.findFirst({
      where: { id: { equals: section.menu.venueId } },
      include: {
        menus: {
          include: {
            sections: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });
    if (venue) {
      await notifyVenueUpdate({ venue });
    }

    return section;
  }

  @Mutation(() => Boolean)
  async moveSection(
    @Arg("sectionId", () => ID) sectionId: string,
    @Arg("sideSectionId", () => ID) sideSectionId: string,
    @Arg("direction", () => Int) direction: number,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ) {
    try {
      const sideSection = await prisma.section.update({
        where: { id: sideSectionId },
        data: {
          sort: {
            decrement: direction,
          },
        },
      });

      const section = await prisma.section.update({
        where: { id: sectionId },
        data: {
          sort: sideSection.sort + direction,
        },
        include: { menu: true },
      });

      const venue = await prisma.venue.findFirst({
        where: { id: { equals: section.menu.venueId } },
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

  @Mutation(() => Boolean)
  async deleteSection(
    @Arg("sectionId", () => ID) sectionId: string,
    @Ctx() { prisma }: MyContext,
    @PubSub(Topic.VenueUpdated)
    notifyVenueUpdate: Publisher<VenueUpdatedPayload>
  ): Promise<boolean> {
    try {
      const items = await prisma.item.findMany({
        where: {
          sectionId,
        },
      });

      const imageDeletionTransactions = items.reduce<
        PrismaPromise<Prisma.BatchPayload>[]
      >((carry, item) => {
        const deleteImages = prisma.image.deleteMany({
          where: {
            imageableType: "Item",
            imageableId: item.id,
          },
        });
        carry.push(deleteImages);
        return carry;
      }, []);

      const deleteItems = prisma.item.deleteMany({
        where: {
          sectionId,
        },
      });

      const deleteSection = prisma.section.delete({
        where: { id: sectionId },
        include: { menu: true },
      });

      const transaction = await prisma.$transaction([
        deleteItems,
        deleteSection,
        ...imageDeletionTransactions,
      ]);

      const [, { menu }] = transaction;

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
