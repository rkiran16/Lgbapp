const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Odetails'
    },
    for: {
      type: String
    },
    date: {
      type: Date
    }
  }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
