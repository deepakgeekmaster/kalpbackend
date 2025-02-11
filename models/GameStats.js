const mongoose = require('mongoose');
const gamestatsSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalWins: { type: Number, required: true, default: 0 },
  totalLoose: { type: Number, required: true, default: 0 },
  totalDraw: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const GameStats = mongoose.model('GameStats', gamestatsSchema);

module.exports = GameStats;
