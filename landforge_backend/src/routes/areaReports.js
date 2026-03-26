const router = require('express').Router();
const AreaReport = require('../models/AreaReport');

// GET /api/area-reports?location= — cached lookup
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    const reports = await AreaReport.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/area-reports — save a new AI area intelligence report
router.post('/', async (req, res) => {
  try {
    const report = await AreaReport.create(req.body);
    res.status(201).json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
