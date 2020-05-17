const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const statePostSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    country: {
      type: Schema.Types.ObjectId,
        ref: 'Country'
    },
    block: {
        type: Boolean,
        required: true,
        default: false
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('State', statePostSchema);
