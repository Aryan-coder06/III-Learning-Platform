const SkillShare = require('../models/SkillShare');
const User = require('../models/User'); // Used if we need further population, though populate('author') will generally suffice

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await SkillShare.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 }); // newest first
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching skill share posts:', error);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, description, type, authorId, sessionDate, maxCap } = req.body;

        if (!title || !description || !type || !authorId) {
            return res.status(400).json({ message: 'Provide title, description, type, and authorId.' });
        }

        const newPost = new SkillShare({
            title,
            description,
            type,
            author: authorId,
            sessionDate,
            maxCap: maxCap || 50
        });

        const savedPost = await newPost.save();
        const populatedPost = await savedPost.populate('author', 'name email');

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating skill share post:', error);
        res.status(500).json({ message: 'Server error creating post.' });
    }
};

exports.rsvpPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }

        const post = await SkillShare.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check max capacity
        if (post.rsvps.length >= post.maxCap) {
            return res.status(400).json({ message: 'This session is already at full capacity.' });
        }

        // Check if already RSVP'd
        if (post.rsvps.includes(userId)) {
            return res.status(400).json({ message: 'You have already RSVP\'d to this session.' });
        }

        post.rsvps.push(userId);
        await post.save();

        const updatedPost = await SkillShare.findById(id).populate('author', 'name email');
        
        res.status(200).json({ message: 'RSVP successful', post: updatedPost });
    } catch (error) {
        console.error('Error RSVPing to post:', error);
        res.status(500).json({ message: 'Server error processing RSVP.' });
    }
};

exports.cancelRsvp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }

        const post = await SkillShare.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Remove the user from the rsvps array
        post.rsvps = post.rsvps.filter(r => r.toString() !== userId.toString());
        await post.save();

        const updatedPost = await SkillShare.findById(id).populate('author', 'name email');

        res.status(200).json({ message: 'RSVP cancelled', post: updatedPost });
    } catch (error) {
        console.error('Error cancelling RSVP:', error);
        res.status(500).json({ message: 'Server error processing cancellation.' });
    }
};
