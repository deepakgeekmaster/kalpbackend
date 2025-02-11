const setupSocket = (io) => {
  let rooms = {};
  let clients = {}; 

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("createRoom", (roomId) => {
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push(socket.id);
      clients[socket.id] = roomId; 
      socket.join(roomId);
      socket.emit("message", `Room ${roomId} created successfully.`);
      console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on("joinRoom", (roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].push(socket.id);
        clients[socket.id] = roomId; 
        socket.join(roomId);
        io.to(roomId).emit("userJoined", { userId: socket.id, roomId });
        console.log(`${socket.id} joined room ${roomId}`);
      } else {
        socket.emit("message", "Room does not exist.");
      }
    });

    socket.on("sendMessage", (roomId, message) => {
      console.log(message);
      io.to(roomId).emit("message", message);
    });

    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', { from: socket.id, data });
    });
  

    socket.on("disconnect", () => {
      const roomId = clients[socket.id];
      if (roomId) {
        rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
        delete clients[socket.id]; 
        io.to(roomId).emit("message", `${socket.id} has left the room.`);
        console.log(`User ${socket.id} disconnected from room ${roomId}`);
      }
    });
  });
};

module.exports = { setupSocket };
