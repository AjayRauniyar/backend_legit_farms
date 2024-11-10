const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./models');
const mainAdmin =require('./routes/mainAdminRoutes')
const adminRoutes = require('./routes/adminRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const config = require('./config/config');
const cors = require('cors');
const { testuser } = require('./models');


const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




































// Helper function to create JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: '1h' });
};

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await testuser.create({ username, email, password });
    const token = generateToken(user);
    res.status(201).json({ message: 'Signup successful', token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error during signup', error });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await testuser.findOne({ where: { username } });
    if (user && await user.validPassword(password)) {
      const token = generateToken(user);
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(400).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login', error });
  }
});

























// Middleware to parse URL-encoded bodies (from HTML forms, etc.)
app.use(express.urlencoded({ extended: true }));
app.use('/api/mainadmin', mainAdmin);
app.use('/api/admin', adminRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);
app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

const startServer = async () => {
    try {
        await sequelize.sync();
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

startServer();

