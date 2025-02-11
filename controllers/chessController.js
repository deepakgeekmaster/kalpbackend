const rooms = {}; 

exports.createRoom = (req, res) => {
  const roomId = req.body.roomId;
  if (!rooms[roomId]) {
    rooms[roomId] = { players: [] };
    return res.status(200).json({ message: 'Room created', roomId });
  }
  return res.status(400).json({ message: 'Room already exists' });
};

exports.joinRoom = (req, res) => {
  const { roomId } = req.body;
  if (rooms[roomId] && rooms[roomId].players.length < 2) {
    rooms[roomId].players.push(req.body.playerId);
    return res.status(200).json({ message: 'Joined room successfully' });
  }
  return res.status(400).json({ message: 'Room is full or does not exist' });
};
