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

// ================= CREATE REPORT =================

router.post('/', verifyToken, upload.single('image'), async (req, res) => {

    try {
        const { disasterType, latitude, longitude } = req.body;

        // 🚨 FIX 1: Convert the incoming strings from FormData into actual Numbers
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);

        // 🚨 FIX 2: Use the Number variables for the math calculations
        const nearbyReports = await Report.find({
            latitude: { $gte: latNum - 0.001, $lte: latNum + 0.001 },
            longitude: { $gte: lngNum - 0.001, $lte: lngNum + 0.001 },
            status: "pending"
        });

        let priority = "normal";

        if (nearbyReports.length >= 2) {
            priority = "urgent";
        }

        const report = new Report({
            disasterType,
            description: `${disasterType} reported`,
            mediaUrl: req.file ? req.file.filename : null,
            mediaType: req.file?.mimetype.startsWith('video') ? 'video' : 'photo',
            latitude: latNum,   // 🚨 FIX 3: Save as Number
            longitude: lngNum,  // 🚨 FIX 3: Save as Number
            location: {
                type: "Point",
                coordinates: [lngNum, latNum] // 🚨 FIX 4: GeoJSON requires Numbers
            },
            user: req.user.id,
            status: 'pending',
            priority
        });

        await report.save();

        res.status(201).json({
            message: "Report submitted successfully",
            report
        });

    } catch (err) {
        console.log(err);
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

// ================= ADMIN VERIFY REPORT =================

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {

    try {

        const { status } = req.body;

        const updated = await Report.findByIdAndUpdate(
            req.params.id,
            {
                status,
                verifiedBy: req.user.id,
                verifiedAt: new Date()
            },
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

module.exports = router;