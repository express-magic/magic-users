'use strict';

var express = require('express')
  , router = express.Router();
  , log = require('magic-log')
  , db = require('magic-db')
  , passport = require('passport')
  , local = require('passport-local').Strategy
;



//middleware function
module.exports = function (req, res, next) {
  log('users called');
  
  passport.use(new local(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
  next();
}
