const router = require('express').Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET /api/properties — list all (optionally filter by landlordId, status, city)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.landlordId) filter.landlordId = req.query.landlordId;
    if (req.query.status)     filter.status = req.query.status;
    if (req.query.city)       filter.city = new RegExp(req.query.city, 'i');
    if (req.query.purpose)    filter.purpose = req.query.purpose;
    const properties = await Property.find(filter).populate('landlordId', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Property.findById(req.params.id).populate('landlordId', 'firstName lastName email');
    if (!p) return res.status(404).json({ error: 'Property not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/properties
router.post('/', auth, async (req, res) => {
  try {
    const property = await Property.create({ ...req.body, landlordId: req.body.landlordId || req.user.id });
    res.status(201).json(property);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/properties/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
