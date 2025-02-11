const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String},
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  profile: { type: String },
  studnetid: { type: String },
  interests: { 
    perfomanceMarketing: Boolean,
    organicMarketing: Boolean,
    smm: Boolean,
    content: Boolean,
    developement: Boolean,
    graphic: Boolean,
},
  status: { type: String, default: '0' },
  googleid: { type: String },
  isOnline: { type: Boolean, default: false },
  gameInProgress: { type: Boolean, default: false },
  whichGame: { type: String},
  verified: { type: Boolean, default: false },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
