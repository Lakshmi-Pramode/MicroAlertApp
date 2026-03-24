const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ================= MULTER CONFIG =================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// ================= CREATE REPORT (USER) =================

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { disasterType, latitude, longitude } = req.body;

        // 🚨 FIX: Convert strings to Numbers for math and GeoJSON
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);

        const nearbyReports = await Report.find({
            latitude: { $gte: latNum - 0.001, $lte: latNum + 0.001 },
            longitude: { $gte: lngNum - 0.001, $lte: lngNum + 0.001 },
            status: "pending"
        });

        let priority = nearbyReports.length >= 2 ? "urgent" : "normal";

        const report = new Report({
            disasterType,
            description: `${disasterType} reported`,
            mediaUrl: req.file ? req.file.filename : null,
            mediaType: req.file?.mimetype.startsWith('video') ? 'video' : 'photo',
            latitude: latNum,
            longitude: lngNum,
            location: {
                type: "Point",
                coordinates: [lngNum, latNum] 
            },
            user: req.user.id,
            status: 'pending',
            priority
        });

        await report.save();
        res.status(201).json({ message: "Report submitted successfully", report });

    } catch (err) {
        console.error("❌ Create Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ================= USER VIEW APPROVED REPORTS =================

router.get('/', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ status: 'approved' })
            .populate('user', 'fullName')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADMIN VIEW ALL REPORTS =================

router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('user', 'fullName')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADMIN VERIFY (APPROVE/REJECT) =================

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        // 🚨 FIX: Hex ID safety check to prevent BSON CastError
        const updateData = { status, verifiedAt: new Date() };
        if (req.user.id && req.user.id.length === 24) {
            updateData.verifiedBy = req.user.id;
        }

        const updated = await Report.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updated) return res.status(404).json({ message: "Report not found" });
        res.json(updated);

    } catch (err) {
        console.error("❌ Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ================= ADMIN DELETE PERMANENTLY =================

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // Try to delete the local file on your Acer laptop
        if (report.mediaUrl) {
            try {
                const filePath = path.join(__dirname, '../uploads', report.mediaUrl);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (fErr) {
                console.log("⚠️ File already missing, skipping unlinking.");
            }
        }

        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: "Report deleted permanently" });

    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;