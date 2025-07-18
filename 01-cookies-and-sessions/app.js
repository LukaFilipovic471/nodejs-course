const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://lukakv34:mres7Oytc7GETpxj@cluster0.360mheo.mongodb.net/';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({secret: 'my secret', resave: false, saveUninitialized: false, store: store})
);

app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id).then(user => {
    req.user = user;
    next();
  }).catch(err => console.log(err));
});

app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id).then(user => {
    if(!user){
      return next();
    }
    req.user = user;
    return next();
  }).catch(err => {
    console.log(err);
    next();
  });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(result => {
    console.log('✅ Povezan na MongoDB');
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Max',
          email: 'max@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
