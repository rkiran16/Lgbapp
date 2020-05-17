const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderPostSchema = new Schema(
  {
    shipaddress: {
      type: String,
    },
    totaldiscount: {
      type: Number,
    },
    shiphandling: {
      type: Number,
    },
    ordertotal: {
      type: Number,
    },
    rewardsapply: {
      type: Number,
    },
    paymenttotal: {
      type: Number,
    },
    paymenttype: {
      type: String,
    },
    revoked: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
      required: true
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderPostSchema);
