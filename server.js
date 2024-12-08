require('dotenv').config();
console.log('Environment variables:', {
    mongodb_uri: process.env.MONGODB_URI,
    jwt_secret: process.env.JWT_SECRET
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  // Add this line
const authRoutes = require('./routes/auth');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));  // Add this line

// Routes
app.use('/auth', authRoutes);

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});