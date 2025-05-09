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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});




app.use('/states', stateRoutes);  // Use the state routes

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
  if (req.accepts('html')) {
    res.status(404).send('<h1>404 Not Found</h1>');
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  }
});
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

