const mongoose = require('mongoose');
const dailyupdateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,  
        required: true, 
      },
      image: {
        type: String,  
        required: true,
      },
      likes: [{
        type: String,
        ref: 'Like', 
      }],
}, { timestamps: true });

const DailyUpdates = mongoose.model('DailyUpdates', dailyupdateSchema);

module.exports = DailyUpdates;
