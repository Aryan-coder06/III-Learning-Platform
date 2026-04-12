const cloudinary = require('cloudinary').v2;
const { env } = require('../config/env');

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer The file buffer.
 * @param {string} originalName Original name of the file.
 * @param {string} folder Cloudinary folder name.
 * @returns {Promise<Object>} Cloudinary upload response.
 */
const uploadToCloudinary = (buffer, originalName, folder = 'studysync/pdfs') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        public_id: originalName.split('.')[0] + '-' + Date.now(),
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  uploadToCloudinary,
};
