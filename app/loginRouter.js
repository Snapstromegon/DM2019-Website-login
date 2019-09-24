const express = require('express');
const passport = require('passport');
const Registrant = require('../db/models/Registrant.js');

const router = express.Router();

router.get('/', (req, res) => {
  passport.authenticate('local', async (err, user, info) => {
    if (user || req.user) {
      res.redirect(req.query.redirectBack || '/user');
    } else {
      res.render('pages/login.njk', {
        registrants: await Registrant.findAll({ include: ['User'] })
      });
    }
  })(req, res);
});

/* POST login. */
router.post('/', (req, res) => {
  passport.authenticate('local', async (err, user) => {
    if (err || !user) {
      return res.render('pages/login.njk', {
        registrants: await Registrant.findAll({
          order: [['iufId', 'ASC']],
          include: ['User']
        }),
        failedLogin: true
      });
    } else {
      req.login(user, err => console.error());
      return res.redirect(req.query.redirectBack || '/');
    }
  })(req, res);
});

router.get('/logout', (req, res) => {
  req.logout();
  return res.redirect(req.query.redirectBack || '/');
});

module.exports = router;
