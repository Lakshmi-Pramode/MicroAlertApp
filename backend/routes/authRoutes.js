const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, location } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ fullName, email, password: hashedPassword, location });
        await user.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
        res.json({ token, user: { fullName: user.fullName } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;