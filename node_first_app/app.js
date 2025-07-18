const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const expressHbs = require('express-handlebars');

const errorController = require('./controllers/error');
// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('6817971e4e4a7eb370cbd683').then(user => {
        req.user = user;
        next();
    }).catch();
    // next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://lukakv34:mres7Oytc7GETpxj@cluster0.360mheo.mongodb.net/').then(res => {
    User.findOne().then(user => {
        if(!user){
            const user = new User({name: 'Mikica', email: 'paprikica@gmail.com', cart:{
                items: []
            }});
            user.save();
        }
    });
    app.listen(3000);
}).catch();

// Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, {through: CartItem});
// Product.belongsToMany(Cart, {through: CartItem});
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, {through: OrderItem});


// sequelize
// .sync(/*{force: true}*/)
// .then(res => {
//     return User.findByPk(1);
//     // console.log(res);
// })
// .then(user => {
//     if(!user){
//         return User.create({name: 'Mikica', email: 'primaubulju@gmail.com'});
//     }
//     return user;
// })
// .then(user => {
//     return user.createCart();
// })
// .then(cart => {
//     app.listen(3000);
// })
// .catch();