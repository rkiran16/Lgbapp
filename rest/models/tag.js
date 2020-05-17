const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagPostSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    post: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    block: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No',
        required: true
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Tag', tagPostSchema);
