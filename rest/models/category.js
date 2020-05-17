const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categoryPostSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    url: {
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

module.exports = mongoose.model('Category', categoryPostSchema);
