const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      //default: null
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      //default: null
    },
    title: {
      type: String,
      required: true,
      index: true
    },
    shortdesc: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      index: true
    },
    discount: {
      type: Number,
    },
    imageUrl: {
      type: [String],
    },
    type: {
      type: String,
    },
    stype: {
      type: String,
      required: true
    },
    link: {
      type: String,
    },
    regionLong: {
      type: String,
      index: true
    },
    regionLat: {
      type: String,
      index: true
    },
    button: {
      type: String,
    },
    actiontype: {
      type: String,
    },
    shipmentSize: {
      type: Number
    },
    review:{
      type: Object,
    },
    tag: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      }
    ],
    comment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      }
    ],
    promotion: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Promo',
      }
    ],
    order: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      }
    ],
    stock: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
      }
    ],
    comment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      }
    ],
    unlisted: {
      type: Boolean,
      required: true,
      default: false
    },
  },
  { timestamps: true }
);
postSchema.index({_id:"text", title:"text",price:"text",regionLong:"text",regionLat:"text"})
module.exports = mongoose.model('Post', postSchema);
