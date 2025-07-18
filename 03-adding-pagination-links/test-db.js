const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://lukakv34:mres7Oytc7GETpxj@cluster0.360mheo.mongodb.net/shop')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
