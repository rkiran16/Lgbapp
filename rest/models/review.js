const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    order:{
      type: Schema.Types.ObjectId,
      ref: 'Odetails'
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    text: {
      type: String,
    },
    review: {
      type: Number,
    },
    block: {
      type: Boolean,
      required: true,
      default: false
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

