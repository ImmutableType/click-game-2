const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    scores: [{
        points: Number,
        date: Date
    }],
    firstPlayDate: {
        type: Date,
        default: Date.now
    },
    gamesPlayed: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema);