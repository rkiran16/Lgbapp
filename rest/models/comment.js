const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentPostSchema = new Schema(
  {
    text: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    imageUrl: {
      type: [String],
    },
    block: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No',
        required: true
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentPostSchema);
