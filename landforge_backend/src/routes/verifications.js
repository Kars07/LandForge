const router = require('express').Router();
const DocumentVerification = require('../models/DocumentVerification');

// POST /api/verifications — save AI agent verification result
router.post('/', async (req, res) => {
  try {
    const doc = await DocumentVerification.create(req.body);
    res.status(201).json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/verifications?propertyId=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    if (req.query.landlordId) filter.landlordId = req.query.landlordId;
    const docs = await DocumentVerification.find(filter).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
