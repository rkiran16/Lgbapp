const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const connectionsPostSchema = new Schema(
  {
    connector: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    connection: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    mutual: {
        type: Boolean,
        default: false
    },
    accepted: {
        type: Boolean,
        default: false
    },
    message:{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    block: {
        type: Boolean,
        default: false
    },
  },
  { timestamps: true }
);
connectionsPostSchema.index({_id:"text", block:Boolean, connector:"text",connection:"text"})
module.exports = mongoose.model('Connections', connectionsPostSchema);
