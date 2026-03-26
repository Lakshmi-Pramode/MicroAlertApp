const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database Model & Middleware
const Report = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ================= AI SETUP =================
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

// ================= UPLOAD FOLDER SETUP =================
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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
        const { disasterType, latitude, longitude, address } = req.body;

        // Convert strings to Numbers for math and GeoJSON
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
            address, 
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

// ================= ADMIN VERIFY (SMART APPROVE/REJECT) =================
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: "Report not found" });

        // SCENARIO 1: Admin clicks "Reject" (Skip AI, reject immediately)
        if (status === 'rejected') {
            report.status = 'rejected';
            report.verifiedAt = new Date();
            if (req.user.id && req.user.id.length === 24) report.verifiedBy = req.user.id;
            
            await report.save();
            return res.json({ message: "Manually rejected by Admin", report });
        }

        // SCENARIO 2: Admin clicks "Approve" (Send to AI)
        if (status === 'approved') {
            if (!report.mediaUrl) {
                return res.status(400).json({ message: "No image attached to analyze" });
            }

            // Find the image on your laptop
            const imagePath = path.join(__dirname, '../uploads', report.mediaUrl);
            
            if (!fs.existsSync(imagePath)) {
                return res.status(400).json({ message: "Image file missing from server. Cannot analyze." });
            }

            console.log(`🧠 AI is analyzing image: ${report.mediaUrl}...`);

            // 1. Set up AI Model & Prompt
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
              You are an emergency response AI for a disaster management app. 
              Analyze this image specifically looking for natural disasters like Floods, Fires, and Landslides.
              
              Rules:
              1. Calculate a risk score from 1 to 10 based on severity. 
              2. A puddle or normal rain is a 1. A completely flooded house or collapsed mountain is a 10.
              3. If the image is a selfie, meme, indoors, or irrelevant, set isValid to false and riskScore to 0.
              
              Respond ONLY with a valid JSON object in this exact format, no markdown:
              {"isValid": true, "riskScore": 8, "reason": "short explanation"}
            `;

            // 2. Prepare the Image
            const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const imagePart = fileToGenerativePart(imagePath, mimeType);

            // 3. Fetch AI Decision
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            const aiDecision = JSON.parse(responseText);

            console.log("🤖 AI Decision:", aiDecision);

            // 4. Apply AI Logic to the Database
            if (aiDecision.isValid && aiDecision.riskScore >= 4) {
                report.status = 'approved';
                report.riskScore = aiDecision.riskScore;
                report.aiNotes = aiDecision.reason;
            } else {
                report.status = 'rejected';
                report.aiNotes = "AI Auto-Rejected: " + aiDecision.reason;
                report.riskScore = aiDecision.riskScore || 0;
            }

            // 5. Log the Admin who triggered this
            report.verifiedAt = new Date();
            if (req.user.id && req.user.id.length === 24) report.verifiedBy = req.user.id;
            
            await report.save();

            return res.json({ 
                message: report.status === 'approved' ? "Approved by AI" : "Rejected by AI", 
                report 
            });
        }

    } catch (err) {
        console.error("❌ AI Verify Error:", err.message);
        res.status(500).json({ error: "Server error during AI analysis" });
    }
});

// ================= ADMIN DELETE PERMANENTLY =================
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // Try to delete the local file on your laptop
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