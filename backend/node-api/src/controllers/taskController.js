const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.params.userId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
