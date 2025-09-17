const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars from root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
const allowedOrigins = [
  'https://horario-oishi-restaurante-frontend-delta.vercel.app',
  'http://localhost:5173', // Default Vite dev server port
  'http://localhost:3000'  // Common React dev port
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
};

app.options('*', cors(corsOptions)); // enable pre-flight for all routes
app.use(cors(corsOptions));

app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/workers', require('./routes/workers.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/history', require('./routes/history.routes.js'));
app.use('/api/config', require('./routes/config.routes'));
app.use('/api/auth', require('./routes/auth.routes')); // Corrected path

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded'}`);
});
