const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/instaweb");
const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  picture: {
    type: String,
    
  },
  caption: String,
  like: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  comments: {
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  },
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  
})


module.exports = mongoose.model("post", postSchema);