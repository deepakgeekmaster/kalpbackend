const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const dailyupdateController = require('../controllers/dailyupdateController');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve('public/daily');  // Resolving the absolute path
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
    }
});
const upload = multer({ storage: storage });


router.post('/saveData', upload.single('name'), dailyupdateController.saveData);  // 'name' is the file input name

router.get('/dauily-updates', dailyupdateController.getUpdates);

router.post('/like', dailyupdateController.addLike); 

router.post('/unlike', dailyupdateController.removeLike); 

router.get("/:postId", dailyupdateController.getPostLikes);

router.post('/comments', dailyupdateController.comments); 
router.get('/comments/:postId', dailyupdateController.fetchcomment); 


module.exports = router;
