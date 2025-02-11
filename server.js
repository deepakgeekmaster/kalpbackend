const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const gameRoute = require('./routes/gameRoute');
const dailypdateRoute = require('./routes/dailyUpdate');
const cookieParser = require('cookie-parser'); 
const socketIo = require('socket.io');
const { setupSocket } = require('./sockets/socket');
const path = require('path');

dotenv.config();

const app = express();
const server = require('http').Server(app); 
const io = socketIo(server); 


app.use(express.json()); 
app.use(express.static('public'));
app.use(cookieParser());
connectDB();

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoute);
app.use('/api/dailyupdate', dailypdateRoute);
setupSocket(io);




const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.1.103:${PORT}`);
});
