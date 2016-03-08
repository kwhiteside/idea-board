var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var passport = require('passport');
var jwt      = require('express-jwt');

var Issue   = mongoose.model('Issue');
var Comment = mongoose.model('Comment');
var User    = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// GET ISSUES ==============================

router.get('/issues', function(req, res, next) {
  Issue.find(function(err, issues){
    if(err){ return next(err); }

    res.json(issues);
  });
});

// POST ISSUE TO ISSUES ==============================

router.post('/issues', function(req, res, next) {
  var issue = new Issue(req.body);

  issue.save(function(err, issue){
    if(err){ return next(err); }

    res.json(issue);
  });
});

// GET SPECIFIC ISSUE ==============================

router.get('/issues/:issue', function(req, res, next) {
  req.issue.populate('comments', function(err, issue) {
    if (err) { return next(err); }

    res.json(issue);
  });
});

router.param('issue', function(req, res, next, id) {
  var query = Issue.findById(id);

  query.exec(function (err, issue){
    if (err) { return next(err); }
    if (!issue) { return next(new Error('can\'t find issue')); }

    req.issue = issue;
    return next();
  });
});

// UPVOTE ISSUE ==============================

router.put('/issues/:issue/upvote', function(req, res, next) {
  req.issue.upvote(function(err, issue){
    if (err) { return next(err); }

    res.json(issue);
  });
});

// COMMENT ON ISSUE ==============================

router.post('/issues/:issue/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.issue = req.issue;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.issue.comments.push(comment);
    req.issue.save(function(err, issue) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// COMMENTS ==============================

router.put('/issues/:issue/comments/:comment/upvote', function(req, res, next) {
  req.issue.upvote(function(err, issue){
    if (err) { return next(err); }

    res.json(issue);
  });
});

// GRAB COMMENTS ==============================

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

// REGISTER ROUTE ==============================

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)
  user.save(function (err){

    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

// AUTHENTICATE ROUTE ==============================

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});
