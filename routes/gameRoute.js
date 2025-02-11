const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/findOpponent', gameController.findOpponent);
router.post('/updategamestataus', gameController.updategamestataus);



module.exports = router;
