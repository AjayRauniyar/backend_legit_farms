const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const mainAdmin =require('./routes/mainAdminRoutes')
const adminRoutes = require('./routes/adminRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const config = require('./config/config');
const cors = require('cors');


const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

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
