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
exports.VenueResolver = void 0;
const type_graphql_1 = require("type-graphql");
const entities_1 = require("../entities");
const image_1 = require("./image");
const cloudinary_1 = require("../lib/cloudinary");
const graphql_upload_1 = require("graphql-upload");
const topics_1 = require("./topics");
const venue_resolver_args_1 = require("./venue.resolver.args");
let VenueInput = class VenueInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], VenueInput.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], VenueInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], VenueInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], VenueInput.prototype, "currency", void 0);
VenueInput = __decorate([
    type_graphql_1.InputType()
], VenueInput);
let VenueResolver = class VenueResolver {
    coverImage(venue, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.image.findFirst({
                where: {
                    imageableId: { equals: venue.id },
                    AND: {
                        field: { equals: "cover" },
                        AND: { imageableType: { equals: "Venue" } },
                    },
                },
            });
        });
    }
    logoImage(venue, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.image.findFirst({
                where: {
                    imageableId: { equals: venue.id },
                    AND: {
                        field: { equals: "logo" },
                        AND: { imageableType: { equals: "Venue" } },
                    },
                },
            });
        });
    }
    menu(venue, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.menu.findFirst({
                where: {
                    venueId: { equals: venue.id },
                    AND: { default: { equals: true } },
                },
            });
        });
    }
    venue(id, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.venue.findFirst({ where: { id } });
        });
    }
    createOrUpdateVenue(_a, { prisma }) {
        var { id } = _a, values = __rest(_a, ["id"]);
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.venue.upsert({
                where: { id },
                update: Object.assign({}, values),
                create: Object.assign(Object.assign({}, values), { menus: {
                        create: {},
                    } }),
            });
        });
    }
    venueUpdated({ venue }, { venueId }) {
        if (venueId) {
            return venue;
        }
        return null;
    }
    updateVenueAttribute(id, attribute, value, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const venue = yield prisma.venue.update({
                    where: { id },
                    data: {
                        [attribute]: value,
                    },
                });
                yield notifyVenueUpdate({ venue });
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    updateVenueImage(imageId, file, imageable, { prisma }, notifyVenueUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { createReadStream, filename: name, mimetype } = yield file;
                let { secure_url: path, width, height, } = yield cloudinary_1.uploadStream(createReadStream);
                const image = yield prisma.image.upsert({
                    where: { id: imageId },
                    update: { name, mimetype, path, width, height },
                    create: Object.assign(Object.assign({}, imageable), { name, mimetype, path, width, height }),
                });
                const venue = yield prisma.venue.findFirst({
                    where: { id: { equals: imageable.imageableId } },
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
};
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.Image, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Venue, Object]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "coverImage", null);
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.Image, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Venue, Object]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "logoImage", null);
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.Menu, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Venue, Object]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "menu", null);
__decorate([
    type_graphql_1.Query((_type) => entities_1.Venue, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", (_type) => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "venue", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Venue),
    __param(0, type_graphql_1.Arg("data")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VenueInput, Object]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "createOrUpdateVenue", null);
__decorate([
    type_graphql_1.Subscription(() => entities_1.Venue, {
        topics: topics_1.Topic.VenueUpdated,
        nullable: true,
        filter: ({ payload, args, }) => {
            return payload.venue.id === args.venueId;
        },
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, venue_resolver_args_1.VenueUpdatedArgs]),
    __metadata("design:returntype", Object)
], VenueResolver.prototype, "venueUpdated", null);
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
], VenueResolver.prototype, "updateVenueAttribute", null);
__decorate([
    type_graphql_1.Mutation(() => entities_1.Image),
    __param(0, type_graphql_1.Arg("imageId", (_type) => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("file", () => graphql_upload_1.GraphQLUpload)),
    __param(2, type_graphql_1.Arg("imageable")),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub(topics_1.Topic.VenueUpdated)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, image_1.Imageable, Object, Function]),
    __metadata("design:returntype", Promise)
], VenueResolver.prototype, "updateVenueImage", null);
VenueResolver = __decorate([
    type_graphql_1.Resolver(() => entities_1.Venue)
], VenueResolver);
exports.VenueResolver = VenueResolver;
//# sourceMappingURL=venue.js.map