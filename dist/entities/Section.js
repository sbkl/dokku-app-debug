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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const type_graphql_1 = require("type-graphql");
let Section = class Section {
};
__decorate([
    type_graphql_1.Field((_type) => type_graphql_1.ID, {
        nullable: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field((_type) => String, {
        nullable: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field((_type) => String, {
        nullable: true,
    }),
    __metadata("design:type", String)
], Section.prototype, "menuId", void 0);
__decorate([
    type_graphql_1.Field((_type) => type_graphql_1.Int, {
        nullable: false,
    }),
    __metadata("design:type", Number)
], Section.prototype, "sort", void 0);
__decorate([
    type_graphql_1.Field((_type) => Date, {
        nullable: true,
    }),
    __metadata("design:type", Date)
], Section.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field((_type) => Date, {
        nullable: true,
    }),
    __metadata("design:type", Date)
], Section.prototype, "updatedAt", void 0);
Section = __decorate([
    type_graphql_1.ObjectType({
        isAbstract: true,
    })
], Section);
exports.Section = Section;
//# sourceMappingURL=Section.js.map