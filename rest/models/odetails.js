const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderDetailsPostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    qty: {
        type: Number,
    },
    price: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    linetotal: {
        type: Number,
    },
    status:{
      type: String,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Odetails', orderDetailsPostSchema);
