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
exports.Menu = void 0;
const type_graphql_1 = require("type-graphql");
let Menu = class Menu {
};
__decorate([
    type_graphql_1.Field((_type) => type_graphql_1.ID, {
        nullable: false,
    }),
    __metadata("design:type", String)
], Menu.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field((_type) => String, {
        nullable: true,
    }),
    __metadata("design:type", String)
], Menu.prototype, "venueId", void 0);
__decorate([
    type_graphql_1.Field((_type) => Boolean, {
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Menu.prototype, "default", void 0);
__decorate([
    type_graphql_1.Field((_type) => Date, {
        nullable: true,
    }),
    __metadata("design:type", Date)
], Menu.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field((_type) => Date, {
        nullable: true,
    }),
    __metadata("design:type", Date)
], Menu.prototype, "updatedAt", void 0);
Menu = __decorate([
    type_graphql_1.ObjectType({
        isAbstract: true,
    })
], Menu);
exports.Menu = Menu;
//# sourceMappingURL=Menu.js.map