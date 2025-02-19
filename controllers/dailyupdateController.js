const DailyUpdates = require('../models/DailyUpdate');  
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Like = require('../models/Likes');
const Comment = require('../models/Comments');
const authController = require('./authController');
const ftp = require('basic-ftp');
const fs = require('fs');
const { Readable } = require("stream");
const path = require('path');



async function uploadToFTP(filePath, fileName) {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
      await client.access({
          host: 'ftp.kalpavrikshaacademy.in',
          port: 21,
          user: 'u277356541.deepak',
          password: 'Work@9897',
          secure: process.env.FTP_PORT == 22 // Use secure FTP if port is 22
      });

      await client.ensureDir('updates'); // Make sure the directory exists
      const stream = Readable.from(fileBuffer);
      await client.uploadFrom(stream,  path.join('updates', fileName));

      console.log(`✅ Uploaded: ${fileName}`);
      return `https://${process.env.FTP_HOST}${'updates'}${fileName}`; // Return the image URL
  } catch (error) {
      console.error('❌ FTP Upload Error:', error);
      return null;
  } finally {
      client.close();
  }
}



const saveData = async (req, res) => {
    const { name, editor,category } = req.body; 
    let imageUrl = '';

    if (req.file) {
        const filePath = req.file.path;
        const fileName = Date.now() + path.extname(req.file.originalname);

        // Upload image to FTP
        imageUrl = await uploadToFTP(filePath, fileName);

        // Delete local file after successful upload
        fs.unlinkSync(filePath);
    }


    const newDailyUpdates = new DailyUpdates({
        title: name,  
        description: editor,  
        image: imageUrl,  
        category:category
    });
    try 
    {
      await newDailyUpdates.save();
      const title = 'New Daily Update';
      const message = `A new update has been added: ${name}`;

      await authController.sendnotification({ title, message });

      res.status(201).json({ message: 'Daily data saved successfully!' });

    }
    catch (err) {
      console.error('Error saving survey data:', err);
      res.status(500).json({ message: 'Failed to save survey data', error: err });
  }
   
};
const getUpdates = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const interests = user.interests || {};  
      const categoryFilter = Object.keys(interests).filter(category => interests[category] === true);

      let updates;

      if (categoryFilter.length > 0) {
          updates = await DailyUpdates.find({ category: { $in: categoryFilter } });

          if (updates.length === 0) {
              return res.status(200).json({ message: "No data found for your result" });
          }
      } else {
          updates = await DailyUpdates.find();
      }

      res.status(200).json(updates);

  } catch (error) {
      console.error('Error fetching updates:', error);
      res.status(500).json({ message: "Internal server error" });
  }
};




const addLike = async (req, res) => {

        const { userId,postId } = req.body;

        try {
          const existingLike = await Like.findOne({ userId, postId });

          if (existingLike) {
              return res.status(400).json({ message: "You already liked this post!" });
          }

          const newLike = new Like({ userId, postId });
          await newLike.save();

          await DailyUpdates.findByIdAndUpdate(postId, { $push: { likes: userId } });

          return res.status(200).json({ message: "Post liked successfully!" });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal Server Error" });
      }
  };


  const removeLike = async (req, res) => {
    try {
      const { userId,postId } = req.body;
      const like = await Like.findOneAndDelete({ userId, postId });
      if (!like) {
        console.log('Like not found');
        return; 
      }
      await DailyUpdates.findByIdAndUpdate(postId, {
          $pull: { likes: like.userId }, 
          $inc: { likesCount: -1 },   
      });
  
      console.log('Like removed successfully');
      return res.status(200).json({ message: "Post unlike successfully!" });

    } catch (error) {
      console.error('Error removing like:', error);
    }
  };

  const getpostadta =async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid postId format' });
      }
    
    try {
        const post = await DailyUpdates.findById(postId).populate('likes');
        
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
    
        const userHasLiked = post.likes.some(like => like.userId.toString() === userId);
    
        res.status(200).json({
          likes: post.likes,  
          userHasLiked: userHasLiked,  
          likesCount: post.likes.length
        });
      } catch (error) {
        console.error('Error fetching post data:', error);
        res.status(500).json({ message: 'Error fetching post data', error });
      }
  };

  const getPostLikes = async (req, res) => {

  try {
    const { postId } = req.params;

    const post = await DailyUpdates.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }

}



const comments = async (req, res) => {
  const { user, content,date,postId } = req.body; 

  const newComment = new Comment({
    user: user,  
    content: content,  
    date: date,  
    postId:postId
  });
  try 
  {
    await newComment.save();

    const savedComment = await Comment.findById(newComment._id).populate('user', 'username');

    res.status(201).json({savedComment });

  }
  catch (err) {
    console.error('Error saving Comment data:', err);
    res.status(500).json({ message: 'Failed to save Comment data', error: err });
}
 
};


const fetchcomment = async (req, res) => {
  try {
      const { postId } = req.params;
      const savedComment = await Comment.find({ postId }).populate('user', 'username'); 
      res.status(200).json({savedComment});
  } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments", error });
  }

}
  


module.exports = {
    saveData,
    getUpdates,
    addLike,
    removeLike,
    getpostadta,
    getPostLikes,
    comments,
    fetchcomment
};
