const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/user/:userId', taskController.getTasks);
router.post('/', taskController.createTask);

module.exports = router;
