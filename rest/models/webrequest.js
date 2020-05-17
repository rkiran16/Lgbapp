const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const webRequestSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    reason: {
        type: String,
    },
    mssg: {
        type: String,
        required: true
    },
    response: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    requestDate: {
      type: Date,
      default: function() {
        const today = new Date();
        if (this.email) {
          return today.toDateString("yyyy/mm/dd"); 
        }
        return null;
      }
    }
  }
);

module.exports = mongoose.model('Webform', webRequestSchema);
