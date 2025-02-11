const validateUser = (req, res, next) => {
    const { email, phone, password, gender,username } = req.body;
  
    if (!email || !phone || !password || !gender || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    next();
  };
  
  module.exports = validateUser;
  