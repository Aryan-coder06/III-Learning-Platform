const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/posts', contentController.getPosts);
router.get('/notes/user/:userId', contentController.getNotes);

module.exports = router;
