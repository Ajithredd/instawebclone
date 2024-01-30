var express = require('express');
var router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('./users');
const postModel = require('./posts');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});
router.get('/edit',isLoggedIn, async function(req, res, next) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  res.render('edit', {footer: true, user});
});
router.get('/upload', isLoggedIn, async function(req, res, next) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  res.render('upload', {footer: true, user});
});
router.get('/feed',isLoggedIn, async function(req, res) {
  
  let user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts");

  let posts = await postModel
  .find()
  .populate("user");
    res.render('feed',{user,posts});
});
router.get('/explore',isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  const posts = await postModel.find({});
    res.render('explore',{user,posts});
});
router.get('/search',isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
    res.render('search',{user});
});

router.get('/profile', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts");

  

  let posts = await postModel
  .find()
  .populate("user");
  res.render('profile', {footer: true, user, posts});
});
router.get("/username/:username", isLoggedIn, async function(req,res){
  const regex = new RegExp(`${req.params.username}`,'i')
  const users=await userModel.find({username:regex})
  res.json(users);
})
router.post('/register', function(req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name
  })

  userModel.register(user, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/update',upload.single('image'), isLoggedIn, async function(req, res) {
  const user = await userModel.findOneAndUpdate({username: req.session.passport.user}, {username: req.body.username, name: req.body.name, bio: req.body.bio}, {new: true});
 if(req.file&&req.file.filename.length>0){
  user.picture=req.file.filename;
 }
 await user.save();
  req.login(user, function(err){
    if(err) throw err;
    res.redirect("/profile");
  });
});
router.post('/post', isLoggedIn, upload.single("image"), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    caption: req.body.caption,
    picture: req.file.filename,
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/', function(req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name
  })


  userModel.register(user, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function(req, res){});


router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }

  }

module.exports = router;
