const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { env } = require('./env');

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'studysync-documents',
    format: async (req, file) => 'pdf', 
    public_id: (req, file) => `doc_${Date.now()}`,
  },
});

module.exports = {
  cloudinary,
  storage,
};
