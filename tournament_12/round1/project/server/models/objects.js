const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  path: { type: String, required: true, unique: true },
  owner: { type: String }, // todo
  last_version: { type: mongoose.Schema.ObjectId, ref: "ObjectVersion" },
  versions: [{ type: mongoose.Schema.ObjectId, ref: "ObjectVersion" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = function (connection) {
  return connection.model('Object', schema);
};