const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shipmentSizesPostSchema = new Schema(
  {
    name: {
        type: String,
    },
    price: {
        type: Number,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model('Shipmentsize', shipmentSizesPostSchema);
