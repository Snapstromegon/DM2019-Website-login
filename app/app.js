const express = require('express');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
const passport = require('passport');

require('./passport.js');

const app = express();

nunjucks.configure(__dirname + '/../views', {
  autoescape: true,
  express: app,
  noCache: true
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/static',express.static(__dirname+'/../static'));

app.use(
  '/user',
  passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/?redirectBack=/user'
  }),
  require('./userRouter.js')
);
app.use('/', require('./loginRouter.js'));

module.exports = options => {
  app.listen(options.port, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`App listens ${options.port}`);
    }
  });
};
