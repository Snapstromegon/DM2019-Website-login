const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');

const Registrant = require('../db/models/Registrant.js');

router.get('/', (req, res, next) =>
  passport.authenticate(
    'jwt',
    {
      session: false
    },
    async (err, user) => {
      if (err || !user) {
        res.render('pages/login.njk', {
          registrants: await Registrant.findAll({order:[
            ['iufId', 'ASC']
          ]})
        });
      } else {
        return res.redirect(req.query.redirectBack || '/user');
      }
    }
  )(req, res)
);

/* POST login. */
router.post('/', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err || !user) {
        return res.render('pages/login.njk', {
          registrants: await Registrant.findAll({order:[
            ['iufId', 'ASC']
          ]}),
          failedLogin: true
        });
        // return res.redirect(failureLinkOfRequest(req));
      }

      req.login(user, { session: false }, async err => {
        if (err) {
          res.send(err);
        }

        const token = jwt.sign(
          user,
          config.secrets.login.jwtSecret
        );
        res.cookie('loginJWT', token,{domain: global.config.loginDomain});
        return res.redirect(req.query.redirectBack || '/user');
      });
    }
  )(req, res);
});

router.get('/logout', (req, res) => {
  res.clearCookie('loginJWT',{domain: global.config.loginDomain});
  return res.redirect(req.query.redirectBack || '/');
});

module.exports = router;
