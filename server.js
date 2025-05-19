const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const stateRoutes = require('./routes/states');

dotenv.config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

app.use(express.json());  // For parsing JSON bodies

app.use('/states', stateRoutes);  // Use the state routes

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Catch-all for 404
app.use((req, res) => {
  res.status(404).format({
    html: () => res.sendFile(path.join(__dirname, '404.html')),
    json: () => res.json({ error: '404 Not Found' }),
    default: () => res.type('txt').send('404 Not Found')
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

