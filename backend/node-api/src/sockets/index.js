const socketIo = require('socket.io');

module.exports = (server, corsOptions) => {
    const io = socketIo(server, { cors: corsOptions });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Join room
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // Chat messages
        socket.on('send_message', (data) => {
            io.to(data.roomId).emit('receive_message', data);
        });

        // Whiteboard drawing events
        socket.on('draw', (data) => {
            socket.to(data.roomId).emit('draw', data);
        });

        // WebRTC Signaling for Video
        socket.on('offer', (data) => {
            socket.to(data.roomId).emit('offer', data);
        });

        socket.on('answer', (data) => {
            socket.to(data.roomId).emit('answer', data);
        });

        socket.on('ice_candidate', (data) => {
            socket.to(data.roomId).emit('ice_candidate', data);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};
