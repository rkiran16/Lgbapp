const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rewardPostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    for: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Odetails'
    },
    point: {
      type: Number,
    },
    usage: {
      type: Number,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardPostSchema);
