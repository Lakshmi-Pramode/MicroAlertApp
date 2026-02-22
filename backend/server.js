const dns = require('node:dns'); 
dns.setDefaultResultOrder('ipv4first'); // Must be line 2

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Now this will respect the IPv4 rule

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));