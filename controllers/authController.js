const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const PushToken = require('../models/PushToken'); 
const crypto = require('crypto');
const axios = require('axios');
const ftp = require('basic-ftp');
const fs = require('fs');
const POSTMARK_SERVER_TOKEN = "f3ea7eb0-1eda-440f-9287-78d1a9158fba";
const SENDER_EMAIL = "deepak@geekmaster.io"

const unverifiedUsers = new Map();

const sendVerificationEmail = async (email, verificationCode) => {
  try {
      await axios.post("https://api.postmarkapp.com/email", {
          From: SENDER_EMAIL,
          To: email,
          Subject: "Verify Your Email",
          TextBody: `Your verification code is: ${verificationCode}`,
      }, {
          headers: {
              "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
              "Content-Type": "application/json",
          }
      });

      console.log(`Verification email sent to ${email}`);
  } catch (error) {
      console.error("Error sending email:", error.response?.data || error.message);
  }
}

const register = async (req, res) => {
  const { email, phone, password, gender, username } = req.body;

  try {
    
    const verificationCode = crypto.randomInt(100000, 999999);
    unverifiedUsers.set(email, { username, email, phone, password, gender, verificationCode });

    await sendVerificationEmail(email, verificationCode);

    
    res.status(200).json({ message: "A verification email has been sent. Please check your inbox." });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const userData = unverifiedUsers.get(email);

  if (!userData) {
      return res.status(404).json({ message: "No pending verification for this email." });
  }

  const parsedCode = parseInt(code, 10);
  if (isNaN(parsedCode)) {
    return res.status(400).json({ message: "Invalid verification code format." });
  }

  if (userData.verificationCode !== parsedCode) {
    return res.status(400).json({ message: "Invalid verification code." });
  }

  try {
    const username=userData.username;
    const email=userData.email;
    const phone=userData.phone;
    const password=userData.password;
    const gender=userData.gender;


      const result = await authService.registerUser({ username, email, phone, password, gender,verified: true  });

      console.log(result);

      unverifiedUsers.delete(email);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 31536000000,
      });

      res.status(200).json({ message: "Email verified successfully. You can now log in.",tokensecret: result.token });

  } catch (error) {
      res.status(500).json({ message: "Error saving user. Please try again." });
  }
};

const getUserInfo = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');


    res.status(200).json({ userId: decoded.id,user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


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
        await client.uploadFrom(filePath, fileName);

        console.log(`✅ Uploaded: ${fileName}`);
        return `${fileName}`; // Return the image URL
    } catch (error) {
        console.error('❌ FTP Upload Error:', error);
        return null;
    } finally {
        client.close();
    }
  }


  

  const updateId = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const updateFields = {};
  
      // Process image only if file is selected
      if (req.file) {
        const filePath = req.file.path;
        const fileName = Date.now() + path.extname(req.file.originalname);
  
        // Upload image to FTP
        const uploadedFileName = await uploadToFTP(filePath, fileName);
  
        if (uploadedFileName) {
          updateFields.studentid = uploadedFileName; // Save only filename
          fs.unlinkSync(filePath); // Delete local file after upload
        } else {
          return res.status(500).json({ message: 'FTP Upload Failed' });
        }
      }
  
      // Process interests only if provided
      if (req.body.interests) {
        updateFields.interests = JSON.parse(req.body.interests);
      }
  
      const user = await User.findByIdAndUpdate(decoded.id, updateFields, {
        new: true,
        runValidators: true,
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.status(200).json({ message: 'User ID updated successfully', user });
  
    } catch (error) {
      console.error('Error updating user ID:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  




const google = async (req, res) => {
  const { email, displayName, photoURL, uid } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const newUser = new User({
      username: displayName,
      email: email,
      profile: photoURL,
      googleid: uid,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1y' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 31536000000,
    });
    res.status(201).json({ message: "google account added success", tokensecret: token });

  } catch (error) {
    console.error("Error adding Google account:", error.message);
  }

};



const status = async (req, res) => {
  const { userId, status, online, game } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { isOnline: status, isOnline: online, whichGame: game }, { new: true });

    res.status(201).json({ message: "Status Updated" });

  } catch (err) {
    res.status(500).send('Error updating user status');
  }

};


const googleLogin = async (req, res) => {
  const { email, displayName, photoURL, uid } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1y' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 31536000000,
      });
      return res.status(201).json({ message: "Login SuccessFully", tokensecret: token });
    }
    else {
      const newUser = new User({
        username: displayName,
        email: email,
        profile: photoURL,
        googleid: uid,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1y' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 31536000000,
      });
      res.status(201).json({ message: "google account added success", tokensecret: token });
    }

  } catch (error) {
    console.error("Error adding Google account:", error.message);
  }

};


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (!user.verified) return res.status(403).json({ message: "Please verify your email before logging in." });

    if (!user.password) {
      return res.status(400).json({ message: 'Invalid account: No password found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1y' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 31536000000,
    });

    res.json({ tokensecret: token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const logout = async (req, res) => {

  try {
    res.clearCookie('token');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const savetoken = async (req, res) => {
  
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const existingToken = await PushToken.findOne({ token });
    if (!existingToken) {
      await PushToken.create({ token });
      console.log('Saved Push Token:', token);
    }

    res.status(200).send('Token saved successfully');
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }


};

const sendnotification = async (title, message ) => {


  if (!title.title || !title.message) {
    console.log('Title and message are required');

  }


  try {
    // Fetch all stored push tokens from MongoDB
    const tokens = await PushToken.find({}, 'token');
    if (tokens.length === 0) {
      console.log('No registered push tokens');

    }

    // Format the push notification messages
    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title: title.title,
      body: title.message,
    }));


    // Send notifications using Expo API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const data = await response.json();
    console.log('Expo Push Response:', data);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


const updatuser = async (req, res) => {
  try {
    const { gender, phone, Userid } = req.body;


    const user = await User.findById(Userid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (gender) {
      user.gender = gender;
    }

    if (phone) {
      user.phone = phone;
    }

    await user.save(); // Save the updated user data

    return res.status(200).json({ message: 'User details updated successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};





module.exports = { register, getUserInfo, updateId, google, status, googleLogin,login ,logout,savetoken,sendnotification,updatuser,verifyEmail};
