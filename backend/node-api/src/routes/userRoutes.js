const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync', userController.syncUser);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);
router.post('/:id/files', userController.addUserFile);

module.exports = router;
