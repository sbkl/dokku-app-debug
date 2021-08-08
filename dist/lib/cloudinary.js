"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStream = exports.cloudinaryConfig = void 0;
require("dotenv-safe/config");
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
};
cloudinary_1.default.v2.config(exports.cloudinaryConfig);
const uploadStream = (createReadStream) => {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary_1.default.v2.uploader.upload_stream({
            folder: process.env.CLOUDINARY_FOLDER,
        }, (error, result) => {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        createReadStream().pipe(cld_upload_stream);
    });
};
exports.uploadStream = uploadStream;
//# sourceMappingURL=cloudinary.js.map