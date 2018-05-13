const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  session_key: { type: String }, //
  blocks: { // our chunks
    type: [{
      created_at: { type: Date, default: Date.now },
      content_hash: { type: String },
      range_from: { type: Number },
      range_to: { type: Number },
      size: { type: Number }
    }],
    default: []
  },
  content_type: { type: String },
  total_size: { type: Number }, // bytes
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date } // flag that version uploaded
});

module.exports = function (connection) {
  return connection.model('ObjectVersion', schema);
};