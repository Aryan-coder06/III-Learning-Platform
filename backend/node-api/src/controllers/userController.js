const User = require('../models/User');

exports.syncUser = async (req, res) => {
    try {
        const { userId, email, name, avatarUrl, firebaseUid, role } = req.body;
        
        // Find by email or userId
        let user = await User.findOne({ $or: [{ email }, { userId }] });
        
        if (user) {
            // Update existing user
            user.name = name || user.name;
            user.avatarUrl = avatarUrl || user.avatarUrl;
            user.firebaseUid = firebaseUid || user.firebaseUid;
            await user.save();
        } else {
            // Create new user
            user = new User({
                userId: userId || undefined, // Allow default uuidv4 to trigger if userId is empty
                email,
                name,
                username: email.split('@')[0],
                avatarUrl,
                firebaseUid,
                role: role || 'student'
            });
            await user.save();
        }
        
        res.json(user);
    } catch (error) {
        console.error("Sync User Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id }) || await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { $or: [{ userId: req.params.id }, { _id: req.params.id }] }, 
            req.body, 
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle user file upload metadata from Cloudinary
 */
exports.addUserFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { url, filename, cloudinary_public_id, cloudinary_secure_url, resource_type, format, bytes } = req.body;

        const user = await User.findOne({ $or: [{ userId: id }, { _id: id }] });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.files.push({
            url: url || cloudinary_secure_url,
            filename,
            cloudinary_public_id,
            cloudinary_secure_url,
            resource_type,
            format,
            bytes
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle direct file upload for a user using multer and Cloudinary
 */
exports.uploadUserFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newFile = {
            url: req.file.path,
            filename: req.file.originalname,
            cloudinary_public_id: req.file.filename,
            cloudinary_secure_url: req.file.path,
            resource_type: "raw", 
            format: "pdf", // Cloudinary parsing usually keeps it pdf here.
            bytes: req.file.size
        };

        user.files.push(newFile);
        await user.save();

        res.status(201).json({ user, file: newFile });
    } catch (error) {
        console.error("User File Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
};
