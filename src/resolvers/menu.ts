import { Menu, Section } from "../entities";
import { MyContext } from "../types";
import { Ctx, FieldResolver, Resolver, Root } from "type-graphql";

@Resolver((_type) => Menu)
export class MenuResolver {
  @FieldResolver((_type) => [Section])
  async sections(
    @Root() menu: Menu,
    @Ctx() { prisma }: MyContext
  ): Promise<Section[]> {
    return prisma.section.findMany({
      where: {
        menuId: { equals: menu.id },
      },
      orderBy: { sort: "asc" },
    });
  }
}
