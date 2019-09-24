const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/models/User.js');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[name]',
      passwordField: 'user[password]'
    },
    async (name, password, cb) => {
      try {
        const user = await User.findOne({
          where: { name: name.split(/\d+/).pop().trim() }
        });
        if (user && (await user.verifyPassword(password.trim()))) {
          cb(null, user);
        } else {
          cb(null, false);
        }
      } catch (err) {
        cb(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(undefined, user);
});
