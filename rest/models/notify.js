const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notifyPostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    bodyText: {
      type: String,
    },
    subtitle:{
      type: String,
    },
    title:{
      type: String,
    },
    actionData:{
      type: String,
    },
    seen:{
      type: String
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notifyPostSchema);
