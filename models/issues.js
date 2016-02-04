var mongoose = require('mongoose');

var IssueSchema = new mongoose.Schema({
  title: String,
  department: String,
  description: String,
  upvotes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

IssueSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

mongoose.model('Issue', IssueSchema);