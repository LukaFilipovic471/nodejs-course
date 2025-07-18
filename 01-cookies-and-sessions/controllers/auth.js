const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // console.log(req.get('Cookie').split('=')[1] === 'true');
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'login',
    isAuthentificated: false
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('5bab316ce0a7c75f783cb8a8').then(user => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save(() => {
      res.redirect('/');
    });
  }).catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
};