const passport = require('passport');
const passportJWT = require('passport-jwt');

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

const Registrant = require('../db/models/Registrant.js');
const User = require('../db/models/User.js');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'registrant[name]',
      passwordField: 'registrant[password]',
      passReqToCallback: true
    },
    async (req, name, password, cb) => {
      let login = { loginType: req.body.loginType };
      switch (login.loginType) {
        case 'Registrant':
          //Assume there is a DB module pproviding a global UserModel
          const search = (name.match(/#(?<iufId>\d+) (?<name>.*)/) || {})
            .groups;
          const registrant = await Registrant.findOne({ where: search });
          if (
            registrant &&
            (await registrant.verifyAccessCode(password.trim()))
          ) {
            login.user = await registrant.getSeriealizeable();
          }
          break;
        case 'Admin':
          const user = await User.findOne({ where: { email: name } });
          if (user && (await user.verifyPassword(password))) {
            login.user = await user.getSeriealizeable();
          }

          break;
        default:
          return cb(new Error('Unknown Login Type'), false);
      }
      return cb(null, login.user ? login : false);
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: req => req.cookies.loginJWT,
      secretOrKey: config.secrets.jwtLoginSecret
    },
    async (jwtPayload, cb) => {
      //find the user in db if needed
      switch (jwtPayload.loginType) {
        case 'Registrant':
          return cb(
            null,
            await Registrant.findOne({ where: { id: jwtPayload.user.id } })
          );
        case 'Admin':
            return cb(
              null,
              await User.findOne({ where: { id: jwtPayload.user.id } })
            );
      }
    }
  )
);
