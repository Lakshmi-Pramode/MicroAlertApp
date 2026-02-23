const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');


// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });


// ================= USER: CREATE REPORT =================
router.post(
    '/',
    verifyToken,
    upload.single('image'),
    async (req, res) => {
        try {

            const report = new Report({
                disasterType: req.body.disasterType,
                description: `${req.body.disasterType} reported`,
                mediaUrl: req.file ? req.file.filename : null,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                user: req.user.id,
                status: 'pending'
            });

            await report.save();

            res.status(201).json({
                message: "Report submitted successfully",
                report
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);


// ================= USER: GET APPROVED REPORTS =================
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


// ================= ADMIN: GET ALL REPORTS =================
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


// ================= ADMIN: APPROVE / REJECT =================
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