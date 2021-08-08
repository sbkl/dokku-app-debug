import "dotenv-safe/config";
import cloudinary, { UploadApiResponse } from "cloudinary";
import { ReadStream } from "fs";

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
};

cloudinary.v2.config(cloudinaryConfig);

export const uploadStream = (
  createReadStream: () => ReadStream
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
      },
      (error: any, result: any) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    createReadStream().pipe(cld_upload_stream);
  });
};
