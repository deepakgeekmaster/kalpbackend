const User = require('../models/User');


const findOpponent = async (req, res) => {
  const { userId,game } = req.body;


  try {
    const users = await User.find({
      _id: { $ne: userId }, 
      gameInProgress: { $ne: true }, 
      isOnline: true,
      whichGame:game
    });
    if (users.length === 0) {
      return res.status(400).json({ message: 'No available users for a new game' });
    }

    const randomUser = users[Math.floor(Math.random() * users.length)];

    return res.status(200).json({ message: 'User is available for a new game', opponent: randomUser });

  } catch (err) {
    console.error("Error during findOpponent:", err); 
    return res.status(500).send('Error Finding User');
  }
};


const updategamestataus = async (req, res) => {
  const { userId, opoonentId,game,gameInProgress } = req.body;

  try {
    const user = await User.findById(userId);
    const opponent = await User.findById(opoonentId);

    if (!user || !opponent) {
      return res.status(404).json({ message: "User or Opponent not found" });
    }

    user.gameInProgress = gameInProgress;
    opponent.gameInProgress = gameInProgress;
    if (!gameInProgress) {
      user.whichGame = null;
      opponent.whichGame = null;
    }

    await user.save();
    await opponent.save();

    return res.status(200).json({
      message: "Both users are available for a new game",
      user,
      opponent,
    });
  } catch (err) {
    console.error("Error during updategamestatus:", err);
    return res.status(500).send("Error updating game status");
  }
};



module.exports = { findOpponent,updategamestataus };
