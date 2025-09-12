const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); // Keep this import for other potential uses, but won't use config()
const connectDB = require('./config/db');
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module

// Manually load environment variables from .env
try {
  const envPath = path.resolve(__dirname, '../.env'); // Path to root .env
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('JWT_SECRET=')) {
      process.env.JWT_SECRET = trimmedLine.substring('JWT_SECRET='.length);
    } else if (trimmedLine.startsWith('MONGODB_URI=')) {
      process.env.MONGODB_URI = trimmedLine.substring('MONGODB_URI='.length);
    }
  });
} catch (err) {
  console.error('Error loading environment variables manually:', err.message);
}

console.log('process.env.JWT_SECRET after manual load:', process.env.JWT_SECRET);
console.log('process.env.MONGODB_URI after manual load:', process.env.MONGODB_URI);

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({ origin: 'https://horario-oishi-restaurante-frontend-delta.vercel.app' }));

app.use('/api/workers', require('./routes/workers.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/config', require('./routes/config.routes'));
app.use('/api/auth', require('./routes/auth.routes')); // Corrected path

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded'}`);
});
