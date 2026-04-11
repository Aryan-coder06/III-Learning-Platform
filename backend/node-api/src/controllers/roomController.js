const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('members', 'username');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
