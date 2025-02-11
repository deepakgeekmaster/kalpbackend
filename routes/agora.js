const express = require('express');
const { generateToken } = require('../controllers/tokenController');

const router = express.Router();

router.get('/token', generateToken);

module.exports = router;
