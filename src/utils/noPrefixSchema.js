const mongoose = require('mongoose');

const noPrefixSchema = new mongoose.Schema({
  userid: {
    type: string,
    required: true,
    unique: true,
  },
}, { timestamps: true});

module.exports = mongoose.model("noPrefix", noPrefixSchema);
