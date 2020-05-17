const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const countryPostSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    block: {
        type: Boolean,
        required: true
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserProfile'
      }
    ],
    states: [
      {
        type: Schema.Types.ObjectId,
        ref: 'State'
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', countryPostSchema);
