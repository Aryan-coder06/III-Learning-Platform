const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.post('/sync', userController.syncUser);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);
router.post('/:id/upload', upload.single('file'), userController.uploadUserFile);
router.post('/:id/files', userController.addUserFile);

module.exports = router;
