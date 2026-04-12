const express = require('express');
const router = express.Router();
const skillShareController = require('../controllers/skillShareController');

router.get('/', skillShareController.getAllPosts);
router.post('/', skillShareController.createPost);
router.post('/:id/rsvp', skillShareController.rsvpPost);
router.post('/:id/cancel-rsvp', skillShareController.cancelRsvp);

module.exports = router;
