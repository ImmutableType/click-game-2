const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        
        // Create token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
        res.json({ token, username: user.username });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Create token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
        res.json({ token, username: user.username });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;