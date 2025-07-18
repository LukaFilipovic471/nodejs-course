const express = require('express');

const authController = require('../controllers/auth');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;