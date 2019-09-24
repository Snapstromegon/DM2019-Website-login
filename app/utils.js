function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect(`/?redirectBack=${req.originalUrl}`);
  }
}

module.exports = {
  requireLogin
}