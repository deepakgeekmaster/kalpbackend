const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyUpdates',  
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  
  const Like = mongoose.model('Like', likeSchema);
  
  module.exports = Like;
  