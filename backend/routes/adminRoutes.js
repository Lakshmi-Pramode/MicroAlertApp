const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { adminId, password } = req.body;

    if (adminId === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
        // 🚨 FIX: Using a valid 24-char hex ID and the 'admin' role
        const token = jwt.sign(
            { id: '000000000000000000000001', role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        return res.json({ token, message: "Admin authenticated" });
    }
    res.status(401).json({ message: "Invalid Admin credentials" });
});

module.exports = router;