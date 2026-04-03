const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// ✅ Add resource (NO CHANGE)
router.post('/', async (req, res) => {
  try {
    const { title, type, contact, location, latitude, longitude } = req.body;

    if (!title || !type || !contact || !location) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (!/^[0-9]{10}$/.test(contact)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const resource = new Resource({
      title,
      type,
      contact,
      location,
      coordinates: {
        latitude,
        longitude
      }
    });

    await resource.save();
    res.json(resource);

  } catch (err) {
    res.status(500).json({ error: "Failed to add resource" });
  }
});


// ✅ UPDATED GET (IMPORTANT CHANGE ONLY HERE)
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    // 🔥 ADD latitude & longitude at top level (NO BREAKING CHANGE)
    const formatted = resources.map(r => ({
      ...r._doc,
      latitude: r.coordinates?.latitude,
      longitude: r.coordinates?.longitude
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: "Error fetching resources" });
  }
});


// ✅ Nearby (no change)
router.get('/nearby', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: "Error fetching nearby resources" });
  }
});

module.exports = router;