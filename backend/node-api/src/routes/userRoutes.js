const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);

module.exports = router;
