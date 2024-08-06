// const express = require('express');
// const bodyParser = require('body-parser');
// const { sequelize } = require('./models');
// const adminRoutes = require('./routes/adminRoutes');
// const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
// const authRoutes = require('./routes/authRoutes');
// const errorMiddleware = require('./middlewares/errorMiddleware');
// const config = require('./config/config');

// const app = express();

// app.use(bodyParser.json());
// app.use('/api/admin', adminRoutes);
// app.use('/api/beneficiary', beneficiaryRoutes);
// app.use('/api/auth', authRoutes);
// app.use(errorMiddleware);

// const startServer = async () => {
//     try {
//         await sequelize.sync();
//         app.listen(config.port, () => {
//             console.log(`Server is running on port ${config.port}`);
//         });
//     } catch (error) {
//         console.error('Unable to start server:', error);
//     }
// };

// startServer();


const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const adminRoutes = require('./routes/adminRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const config = require('./config/config');

const app = express();

app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);
app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

const startServer = async () => {
    try {
        await sequelize.sync();
        app.listen(config.port, '0.0.0.0', () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

startServer();
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

