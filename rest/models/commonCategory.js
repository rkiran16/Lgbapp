const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commonCategoryPostSchema = new Schema(
  {
    name: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    block: {
      type: Boolean,
      required: true,
      default: false
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Cocategory', commonCategoryPostSchema);
