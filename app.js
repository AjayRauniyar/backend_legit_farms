const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./models');
const mainAdmin =require('./routes/mainAdminRoutes')
const adminRoutes = require('./routes/adminRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const config = require('./config/config');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

const axios = require('axios');


// In-memory store to temporarily store OTPs
let otps = {};

// Configure the SMTP transporter (example using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'winningaj77@gmail.com', // Replace with your email
    pass: 'gpzymaylvwniccao', // Replace with your email password or App password
  },
});

// Password strength validation (at least 8 chars, 1 uppercase, 1 number, 1 special char)
const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Route to request OTP
app.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Check if the user already exists in the database
  const existingUser = await testuser.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }
  
  // Generate OTP (6-digit number)
  const otp = Math.floor(100000 + Math.random() * 900000); // OTP of 6 digits

  // Save the OTP with email as key (you can add expiry time)
  otps[email] = {
    otp: otp,
    timestamp: Date.now(),
  };

  // Send the OTP email
  const mailOptions = {
    from: 'winningaj77@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Error sending OTP email', error });
    }
    res.status(200).json({ message: 'OTP sent successfully', email: email });
  });
});

// Route to verify OTP and create a user in the database if OTP is valid
app.post('/verify-otp', async (req, res) => {
  const { email, otp, username, password } = req.body;

  if (!email || !otp || !username || !password) {
    return res.status(400).json({ message: 'Email, OTP, username, and password are required' });
  }
  
  // Password strength validation
  if (!passwordStrengthRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.',
    });
  }

  // Check if OTP exists for the email
  if (!otps[email]) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }

  // Check if the OTP has expired (5 minutes expiry)
  const otpData = otps[email];
  const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  if (Date.now() - otpData.timestamp > expirationTime) {
    delete otps[email]; // OTP expired
    return res.status(400).json({ message: 'OTP expired' });
  }

  // Logging for debugging
  console.log(`Received OTP: ${otp}`);
  console.log(`Stored OTP: ${otpData.otp}`);
  
  // Ensure OTP is compared correctly (convert both to strings)
  if (String(otpData.otp) === String(otp)) {
    // OTP is valid, create user in the database
    try {
      // Create user in the database
      const user = await testuser.create({ username, email, password: password });

      // OTP is valid, clear OTP after successful verification
      delete otps[email];

      return res.status(200).json({ message: 'OTP verified and user created successfully', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating user', error });
    }
  } else {
    // OTP is invalid
    return res.status(400).json({ message: 'Invalid OTP' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Step 1: Find the user by username
    console.log("Attempting to find user with username:", username);
    const user = await testuser.findOne({ where: { username, password } });
    
    if (!user) {
      console.error('Invalid username or password:', username);
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    console.log('User found:', username);

    // Step 2: Generate token
    console.log('User found, generating token...');
    const token = generateToken(user);
    console.log('Token generated successfully');
    
    // Step 3: Respond with token
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login', error: error.message || error });
  }
});



// Change Password Route
app.post('/change-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Fetch the user by username
    const user = await testuser.findOne({ where: { username } });

    // Check if the user exists and if the current password matches
    if (user ) {
      // Hash the new password
    

      // Update the user's password in the database
      await user.update({ password: newPassword });

      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Invalid current password or user not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error changing password', error });
  }
});




// Route to request OTP
app.post('/request-otp-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Check if the user already exists in the database
  const existingUser = await testuser.findOne({ where: { email } });
  if (!existingUser) {
    return res.status(400).json({ message: 'User doesnot exists with this email' });
  }
  
  // Generate OTP (6-digit number)
  const otp = Math.floor(100000 + Math.random() * 900000); // OTP of 6 digits

  // Save the OTP with email as key (you can add expiry time)
  otps[email] = {
    otp: otp,
    timestamp: Date.now(),
  };

  // Send the OTP email
  const mailOptions = {
    from: 'winningaj77@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Error sending OTP email', error });
    }
    res.status(200).json({ message: 'OTP sent successfully', email: email });
  });
});
app.post('/verify-otp-password', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  // Check if OTP exists for the email
  if (!otps[email]) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }

  // Log OTP from request and OTP from stored data to help with debugging
  console.log(`OTP from user: ${otp}`);
  console.log(`Stored OTP: ${otps[email].otp}`);

  // Check if the OTP has expired (5 minutes expiry)
  const otpData = otps[email];
  const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  if (Date.now() - otpData.timestamp > expirationTime) {
    delete otps[email]; // OTP expired
    return res.status(400).json({ message: 'OTP expired' });
  }

  // Ensure OTP is compared correctly (convert both to strings)
  if (String(otpData.otp) === String(otp)) {
    // OTP is valid, clear OTP after successful verification
    delete otps[email];

    // You can add your user creation code here, for example:
    try {
     
      return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating user', error });
    }
  } else {
    // OTP is invalid
    return res.status(400).json({ message: 'Invalid OTP' });
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

