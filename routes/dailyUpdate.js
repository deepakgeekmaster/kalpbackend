const express = require('express');
const router = express.Router();
const multer = require('multer');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const dailyupdateController = require('../controllers/dailyupdateController');
const storage = multer.memoryStorage(); // Store file in memory buffer

const upload = multer({ storage: storage });
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


router.post('/saveData', upload.single('image'), dailyupdateController.saveData);  // 'name' is the file input name

router.get('/dauily-updates', dailyupdateController.getUpdates);

router.post('/like', dailyupdateController.addLike); 

router.post('/unlike', dailyupdateController.removeLike); 

router.get("/:postId", dailyupdateController.getPostLikes);

router.post('/comments', dailyupdateController.comments); 
router.get('/comments/:postId', dailyupdateController.fetchcomment); 


module.exports = router;
