const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyUpdates', 
        required: true
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
