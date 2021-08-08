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
exports.ImageResolver = exports.ImageInput = exports.Imageable = void 0;
const graphql_upload_1 = require("graphql-upload");
const entities_1 = require("../entities");
const type_graphql_1 = require("type-graphql");
const cloudinary_1 = require("../lib/cloudinary");
let Imageable = class Imageable {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Imageable.prototype, "imageableType", void 0);
__decorate([
    type_graphql_1.Field((_type) => type_graphql_1.ID),
    __metadata("design:type", String)
], Imageable.prototype, "imageableId", void 0);
__decorate([
    type_graphql_1.Field((_type) => String, { nullable: true }),
    __metadata("design:type", Object)
], Imageable.prototype, "field", void 0);
Imageable = __decorate([
    type_graphql_1.InputType()
], Imageable);
exports.Imageable = Imageable;
let ImageInput = class ImageInput {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    __metadata("design:type", String)
], ImageInput.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ImageInput.prototype, "path", void 0);
ImageInput = __decorate([
    type_graphql_1.InputType()
], ImageInput);
exports.ImageInput = ImageInput;
let ImageResolver = class ImageResolver {
    createOrUpdateImage(id, file, imageable, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createReadStream, filename: name, mimetype } = yield file;
            let { secure_url: path, width, height, } = yield cloudinary_1.uploadStream(createReadStream);
            return prisma.image.upsert({
                where: { id },
                update: { name, mimetype, path },
                create: Object.assign(Object.assign({}, imageable), { name, mimetype, path, width, height }),
            });
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => entities_1.Image),
    __param(0, type_graphql_1.Arg("imageId", (_type) => type_graphql_1.ID)),
    __param(1, type_graphql_1.Arg("file", () => graphql_upload_1.GraphQLUpload)),
    __param(2, type_graphql_1.Arg("imageable")),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Imageable, Object]),
    __metadata("design:returntype", Promise)
], ImageResolver.prototype, "createOrUpdateImage", null);
ImageResolver = __decorate([
    type_graphql_1.Resolver()
], ImageResolver);
exports.ImageResolver = ImageResolver;
//# sourceMappingURL=image.js.map