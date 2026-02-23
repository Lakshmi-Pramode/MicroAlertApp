// Force IPv4 (Fixes MongoDB Atlas connection issues)
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ======================
// MIDDLEWARE
// ======================

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Serve uploaded files (images/videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// DATABASE CONNECTION
// ======================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    });

// ======================
// ROUTES
// ======================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes')); // 🔥 Added resources route

// ======================
// ROOT TEST ROUTE
// ======================

app.get('/', (req, res) => {
    res.send("🚀 Micro-Alert Backend Running");
});

// ======================
// ERROR HANDLING (Optional but Professional)
// ======================

app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});