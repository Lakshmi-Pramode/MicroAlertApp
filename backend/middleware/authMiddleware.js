const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "No token provided." });

    try {
        const tokenString = token.replace('Bearer ', '');
        const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

const verifyAdmin = (req, res, next) => {
    // 🚨 FIX: Strict role check
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied. Admins only." });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };