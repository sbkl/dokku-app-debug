"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionResolver = void 0;
const type_graphql_1 = require("type-graphql");
const entities_1 = require("../entities");
const topics_1 = require("./topics");
let SectionInput = class SectionInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SectionInput.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SectionInput.prototype, "menuId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SectionInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], SectionInput.prototype, "sort", void 0);
SectionInput = __decorate([
    type_graphql_1.InputType()
], SectionInput);
let SectionResolver = class SectionResolver {
    items(section, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.item.findMany({
                where: {
                    sectionId: section.id,
                },
                orderBy: { sort: "asc" },
            });
        });
    }
    createOrUpdateSection(_a, { prisma }, notifyVenueUpdate) {
        var { id, sort, menuId } = _a, args = __rest(_a, ["id", "sort", "menuId"]);
        return __awaiter(this, void 0, void 0, function* () {
            if (id === "") {
                const lastSection = yield prisma.section.findFirst({
                    where: {
                        menuId,
                    },
                    orderBy: { sort: "desc" },
                });
                sort = lastSection ? (lastSection === null || lastSection === void 0 ? void 0 : lastSection.sort) + 1 : sort;
            }
            const section = yield prisma.section.upsert({
                where: { id },
                update: Object.assign({ menuId, sort }, args),
                create: Object.assign({ menuId, sort }, args),
                include: {
                    menu: true,
                },
            });
            if (id === "") {
                yield prisma.item.create({
                    data: {
                        sectionId: section.id,
                        name: "",
                        description: "",
                        price: 0,
                        sort: 1,
                    },
                });
            }
            const venue = yield prisma.venue.findFirst({
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
                yield notifyVenueUpdate({ venue });
            }
            return section;
        });
    }
    moveSection(sectionId, sideSectionId, direction, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sideSection = yield prisma.section.update({
                    where: { id: sideSectionId },
                    data: {
                        sort: {
                            decrement: direction,
                        },
                    },
                });
                const section = yield prisma.section.update({
                    where: { id: sectionId },
                    data: {
                        sort: sideSection.sort + direction,
                    },
                    include: { menu: true },
                });
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: section.menu.venueId } },
                });
                if (venue) {
                    yield notifyVenueUpdate({ venue });
                }
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    deleteSection(sectionId, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield prisma.item.findMany({
                    where: {
                        sectionId,
                    },
                });
                const imageDeletionTransactions = items.reduce((carry, item) => {
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
                const transaction = yield prisma.$transaction([
                    deleteItems,
                    deleteSection,
                    ...imageDeletionTransactions,
                ]);
                const [, { menu }] = transaction;
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: menu.venueId } },
                });
                if (venue) {
                    yield notifyVenueUpdate({ venue });
                }
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver((_type) => [entities_1.Item]),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Section, Object]),
    __metadata("design:returntype", Promise)
], SectionResolver.prototype, "items", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Section),
    __param(0, type_graphql_1.Arg("data")),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SectionInput, Object, Function]),
    __metadata("design:returntype", Promise)
], SectionResolver.prototype, "createOrUpdateSection", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("sectionId", () => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("sideSectionId", () => type_graphql_1.ID)),
    __param(2, type_graphql_1.Arg("direction", () => type_graphql_1.Int)),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, Function]),
    __metadata("design:returntype", Promise)
], SectionResolver.prototype, "moveSection", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("sectionId", () => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Function]),
    __metadata("design:returntype", Promise)
], SectionResolver.prototype, "deleteSection", null);
SectionResolver = __decorate([
    type_graphql_1.Resolver(() => entities_1.Section)
], SectionResolver);
exports.SectionResolver = SectionResolver;
//# sourceMappingURL=section.js.map