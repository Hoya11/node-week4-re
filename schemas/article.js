const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  // articleId: {
  //     type: String,
  //     unique: true
  // },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("article", articleSchema);
