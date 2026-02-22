const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Create report (User)
router.post('/', verifyToken, async (req, res) => {
    try {
        const report = new Report({
            ...req.body,
            user: req.user.id
        });
        await report.save();
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all reports (Admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    const reports = await Report.find().populate('user', 'fullName');
    res.json(reports);
});

// Approve/Reject (Admin)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(report);
});

module.exports = router;