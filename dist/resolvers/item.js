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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemResolver = void 0;
const type_graphql_1 = require("type-graphql");
const entities_1 = require("../entities");
const graphql_upload_1 = require("graphql-upload");
const image_1 = require("./image");
const cloudinary_1 = require("../lib/cloudinary");
const topics_1 = require("./topics");
let ItemResolver = class ItemResolver {
    image(item, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.image.findFirst({
                where: {
                    imageableId: { equals: item.id },
                    AND: { imageableType: { equals: "Item" } },
                },
            });
        });
    }
    createItem(sectionId, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastItem = yield prisma.item.findFirst({
                where: {
                    sectionId,
                },
                orderBy: { sort: "desc" },
            });
            const sort = lastItem ? (lastItem === null || lastItem === void 0 ? void 0 : lastItem.sort) + 1 : 1;
            return yield prisma.item.create({
                data: {
                    sectionId,
                    name: "",
                    description: "",
                    price: 0,
                    sort,
                },
            });
        });
    }
    updateItemAttribute(id, attribute, value, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield prisma.item.update({
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
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: item === null || item === void 0 ? void 0 : item.section.menu.venueId } },
                });
                if (venue) {
                    yield notifyVenueUpdate({ venue });
                }
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    moveItem(itemId, sideItemId, direction, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sideItem = yield prisma.item.update({
                    where: { id: sideItemId },
                    data: {
                        sort: {
                            decrement: direction,
                        },
                    },
                });
                const item = yield prisma.item.update({
                    where: { id: itemId },
                    data: {
                        sort: sideItem.sort + direction,
                    },
                    include: { section: { include: { menu: true } } },
                });
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: item.section.menu.venueId } },
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
    updateItemImage(imageId, file, imageable, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { createReadStream, filename: name, mimetype } = yield file;
                let { secure_url: path, width, height, } = yield cloudinary_1.uploadStream(createReadStream);
                const image = yield prisma.image.upsert({
                    where: { id: imageId },
                    update: { name, mimetype, path, width, height },
                    create: Object.assign(Object.assign({}, imageable), { name, mimetype, path, width, height }),
                });
                const item = yield prisma.item.findFirst({
                    where: { id: { equals: imageable.imageableId } },
                    include: { section: { include: { menu: true } } },
                });
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: item === null || item === void 0 ? void 0 : item.section.menu.venueId } },
                });
                if (venue) {
                    yield notifyVenueUpdate({ venue });
                }
                return image;
            }
            catch (e) {
                return null;
            }
        });
    }
    deleteItem(itemId, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const transaction = yield prisma.$transaction([deleteImages, deleteItem]);
                const [, { section: { menu }, },] = transaction;
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
    type_graphql_1.FieldResolver(() => entities_1.Image, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Item, Object]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "image", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Item),
    __param(0, type_graphql_1.Arg("sectionId", () => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "createItem", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", (_type) => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("attribute")),
    __param(2, type_graphql_1.Arg("value")),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Function]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "updateItemAttribute", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("itemId", () => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("sideItemId", () => type_graphql_1.ID)),
    __param(2, type_graphql_1.Arg("direction", () => type_graphql_1.Int)),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, Function]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "moveItem", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Image),
    __param(0, type_graphql_1.Arg("imageId", (_type) => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("file", (_type) => graphql_upload_1.GraphQLUpload)),
    __param(2, type_graphql_1.Arg("imageable")),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, image_1.Imageable, Object, Function]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "updateItemImage", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("itemId", () => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Function]),
    __metadata("design:returntype", Promise)
], ItemResolver.prototype, "deleteItem", null);
ItemResolver = __decorate([
    type_graphql_1.Resolver(() => entities_1.Item)
], ItemResolver);
exports.ItemResolver = ItemResolver;
//# sourceMappingURL=item.js.map