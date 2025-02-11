const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
  gameName: { type: String, required: true, unique: true },
}, { timestamps: true });

const Game = mongoose.model('Games', gameSchema);

module.exports = Game;
