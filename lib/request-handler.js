var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  console.log('render Index page');
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  //Huh?
  Link.find().exec(function(err, links) {
    res.send(200, links.models);
  })
};

//it responds with short links tests this
exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  console.log('looking for link: ', uri);
  Link.find({ 'url': uri }).select('url').exec(function(err, found) {
    console.log('db returned: ', found, 'with err: ', err);
    if (found.length > 0) {
      console.log('found something! ', found);
      res.send(200, found[0]);
    } else {
      console.log('did not find something!');
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
        });

        link.save(function(err) {
          if(err){throw err};
          res.send(200, link);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        console.log('user methods: ', user);
        user.comparePassword(password, function(match) {
          if (match) {
            console.log('match');
            util.createSession(req, res, user);
            // res.redirect('/');
            // return;
          } else {
            console.log('no match');
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        console.log('SignUp - No user found');
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(newUser) {
          console.log('saved new user');
          util.createSession(req, res, newUser);
          res.redirect(301, '/');
        });
        console.log('new user: ', newUser);
      } else {
        console.log('Account already exists');
        res.redirect('/');
      }
    })
};

exports.navToLink = function(req, res) {
  console.log('redirect to link ', req.url);
  console.log('this link: ', req.params);
  Link.findOne({ code: req.params[0] }).select('url').exec(function(err, link) {
    if (!link) {
      console.log('did not find link');
      res.redirect('/');
    } else {
      console.log('found link');
      // link.set({ visits: link.get('visits') + 1 });
      link.save(function(err) {
          if(err){console.log('ERROR: ', err);}
          console.log('link or: ', link);
          return res.redirect(link.get('url'));
        });
    }
  });
};