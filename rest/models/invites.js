const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const invitePostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    invited: {
      type: Schema.Types.Mixed
    },
    code:{
      type: String,
    },
    status:{
      type: String,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Invite', invitePostSchema);
