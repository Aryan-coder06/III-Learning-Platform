const Post = require('../models/Post');
const Note = require('../models/Note');

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.params.userId });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
