'use strict';
var log = require('magic-log');

//middleware function
exports.init = function (schema, next) {
  var User, Meta, Roles;

  User = schema.define( 'User', {
    name:  { type: String, length: 23, index: true }
  , email: { type: String, length: 100, index: true }
  , pass:  { type: String, length: 100 }
  });

  User.validatesPresenceOf('name', 'email', 'pass');
  User.validatesUniquenessOf('name', {message: 'name already exists'});
  User.validatesLengthOf('pass', {min: 10, message: {min: 'password too short (min of 10 chars)'}});
  User.validatesUniquenessOf('email', { message: 'email already in use' });

  User.prototype.validatePassword = function(name, pass, next) {
    User.findOne({name: name, pass: pass}, function(err, user) {
      next(err, user);
    });
  }

  User.prototype.add = function (user, cb) {
    var user = new User({
          name: user.name
        , email: user.email
        , pass: user.pass
      })
      , roles = new Roles(user.roles)
      , meta = new Meta(user.meta)
    ;

    async.series([
        user.save
      , roles.save
      , meta.save
    ], function (err, results) {
      console.log('user add done');
    });
  }

  Meta = schema.define('UserMeta', {
    bio     : { type: Schema.Text }
  , joinDate: { type: Date, default: Date.now }
  });

  Roles = schema.define('UserRoles', {
    host:   { type: String, index: true }
  , role:   { type: String, default: 'subscriber', index: true }
  });

  Roles.validatesInclusionOf('role', {in: ['subscriber', 'editor', 'administrator']});

  User.hasMany(Roles, { as: 'roles', foreignKey: 'userId' });

  Meta.belongsTo(User, { as: 'meta', foreignKey: 'userId' });

  User.prototype.meta = Meta;
  User.prototype.Roles = Roles;

  if ( typeof next === 'function' ) { return next(); }  
}
