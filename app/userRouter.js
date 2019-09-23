var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('pages/user.njk', { user: req.user });
});

/* GET user profile. */
router.get('/profile', function(req, res, next) {
  res.send(req.user);
});

module.exports = router;
