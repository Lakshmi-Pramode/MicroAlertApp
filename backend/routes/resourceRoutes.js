const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// ✅ 1. ADD RESOURCE (POST)
router.post('/', async (req, res) => {
  try {
    const { title, type, contact, location, latitude, longitude } = req.body;

    if (!title || !type || !contact || !location) {
      return res.status(400).json({ error: "All fields required" });
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
    res.status(201).json(resource);
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: "Failed to add resource" });
  }
});

// ✅ 2. GET ALL RESOURCES (GET)
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    // Formatting to ensure latitude/longitude are accessible at top level if needed
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

// ✅ 3. DELETE RESOURCE (DELETE)
// This matches the API.delete(`/resources/${id}`) call from your frontend
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Use Mongoose to find and remove by the internal _id
    const deletedResource = await Resource.findByIdAndDelete(id);

    if (!deletedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json({ message: "Resource deleted successfully", id });
  } catch (err) {
    console.error("DELETE Error:", err);
    res.status(500).json({ error: "Server error during deletion" });
  }
});

// ✅ 4. GET NEARBY (STUB)
router.get('/nearby', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: "Error fetching nearby resources" });
  }
});

module.exports = router;