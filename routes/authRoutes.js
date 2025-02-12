const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const validateUser = require('../middlewares/validateUser');
const authMiddleware = require('../middlewares/authMiddleware'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const upload = require('../middlewares/multerConfig');  // Multer config

router.post('/login',authController.login);

router.post('/register', authController.register);

router.post('/verify-email',authController.verifyEmail);

router.post('/logout',authController.logout);


router.get('/user-info', authController.getUserInfo);

router.put('/uploadId', upload.single('image'), authController.updateId);

router.post('/google',authController.google);

router.put('/update-status',authController.status);

router.post('/googleLogin',authController.googleLogin);

router.post('/save-token',authController.savetoken);

router.post('/send-notification',authController.sendnotification);

router.put('/updatuser',authController.updatuser);


module.exports = router;
