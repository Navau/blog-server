const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const PostSchema = Schema({
  title: String,
  url: {
    type: String,
    unique: true,
  },
  sprint: Number,
  history: Number,
  description: String,
  date: Date,
});

//TODO: Poner Historia al Modelo

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Post", PostSchema);
