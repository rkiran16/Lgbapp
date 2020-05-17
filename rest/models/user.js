const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postUserSchema = new Schema(
  {
    recid: {
      type: String,
      required: true
    },
    displayName:{ 
      type: String,
      index: true
    },
    fname: {
      type: String,
      index: true
    },
    lname: {
      type: String,
      index: true
    },
    bizname: {
      type: String,
      index: true
    },
    desc: {
      type: String,
    },
    dob: {
      type: String,
    },
    sex: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      default: 'Null',
      index: true
    },
    phonenum: {
      type: String,
      index:true
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
        type: Schema.Types.ObjectId,
        ref: 'State'
    },
    zip: {
      type: String,
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country'
    },
    userS: {
      type: String,
    },
    userStatus: {
      type: Boolean,
      default: false
    },
    img: {
      type: [String],
    },
    notificationtoken: {
      type: String,
    },
    blockuser: {
      type: Boolean,
      required: true,
      default: false
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    interest: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Interest'
      }
    ],
    follow: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow'
      }
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Orders'
      }
    ],
    saveditem: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SavedItem'
      }
    ],
    tranzact: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    ],
    reward: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reward'
      }
    ],
    Chat: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat'
      }
    ],
    comment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reviews'
      }
    ],
    promo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Promo'
      }
    ],
    search: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Searches'
      }
    ],
    notify: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notify'
      }
    ],
  },
  { timestamps: true }
);
postUserSchema.index({_id:"text", unlisted:Boolean, displayName:"text",fname:"text",lname:"text",bizname:"text",email:"text",phonenum:"text"})

module.exports = mongoose.model('User', postUserSchema);
