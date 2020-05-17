const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messagePostSchema = new Schema(
  {
    conn: {
      type: Schema.Types.ObjectId,
      ref: 'Connections'
    },
    text: {
      type: [Object],
    },
    status:{
      type: Boolean,
      default: true
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Message', messagePostSchema);
