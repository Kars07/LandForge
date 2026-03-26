const router = require('express').Router();
const SuiTransaction = require('../models/SuiTransaction');

// POST /api/sui-events — store a Sui blockchain event
router.post('/', async (req, res) => {
  try {
    const event = await SuiTransaction.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Sui event already recorded', txDigest: req.body.txDigest });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sui-events?propertyId=&userId=&eventType=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    if (req.query.userId)     filter.userId = req.query.userId;
    if (req.query.eventType)  filter.eventType = req.query.eventType;
    if (req.query.txDigest)   filter.txDigest = req.query.txDigest;
    const events = await SuiTransaction.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
