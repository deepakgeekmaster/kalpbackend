const express = require('express');
const router = express.Router();
const chessController = require('../controllers/chessController');

router.post('/create', chessController.createRoom);
router.post('/join', chessController.joinRoom);

module.exports = router;
