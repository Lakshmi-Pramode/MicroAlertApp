const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ================= USER: Create Report =================
router.post('/', verifyToken, async (req, res) => {
    try {
        const report = new Report({
            ...req.body,
            user: req.user.id,
            status: 'pending'
        });

        await report.save();
        res.status(201).json(report);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= USER: Get Approved Reports (Alerts) =================
router.get('/', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ status: 'approved' })
            .populate('user', 'fullName');

        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADMIN: Get All Reports =================
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('user', 'fullName');

        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADMIN: Approve / Reject =================
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const updated = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;