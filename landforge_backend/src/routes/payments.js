const router = require('express').Router();
const Payment = require('../models/Payment');
const EscrowWallet = require('../models/EscrowWallet');

// POST /api/payments — record a completed ISW payment
router.post('/', async (req, res) => {
  try {
    const { iswTxnRef, amount, buyerId, propertyId, landlordId, purpose, iswResponse, suiTxDigest, suiListingId } = req.body;
    // Create payment record
    const payment = await Payment.create({
      iswTxnRef, amount, buyerId, propertyId, landlordId,
      purpose: purpose || 'purchase',
      status: 'success',
      iswResponse,
      suiTxDigest,
      suiListingId,
      onChainSettled: !!suiTxDigest,
    });

    // Update landlord's escrow wallet balance
    if (landlordId && amount) {
      await EscrowWallet.findOneAndUpdate(
        { landlordId },
        { $inc: { balance: amount, totalReceived: amount } },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(payment);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Payment with this txnRef already recorded' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments?landlordId=&buyerId=&propertyId=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.landlordId) filter.landlordId = req.query.landlordId;
    if (req.query.buyerId)    filter.buyerId = req.query.buyerId;
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    const payments = await Payment.find(filter)
      .populate('buyerId', 'firstName lastName email')
      .populate('propertyId', 'title city state')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
