const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');


const stateRoutes = require('./routes/states');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins unless specified
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json()); // For parsing JSON bodies

// State API routes
app.use('/states', stateRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).format({
    html: () => res.sendFile(path.join(__dirname, '404.html')),
    json: () => res.json({ error: '404 Not Found' }),
    default: () => res.type('txt').send('404 Not Found'),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

