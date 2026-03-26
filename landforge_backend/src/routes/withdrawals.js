const router = require('express').Router();
const Withdrawal = require('../models/Withdrawal');
const EscrowWallet = require('../models/EscrowWallet');

// POST /api/withdrawals — record a withdrawal request and result
router.post('/', async (req, res) => {
  try {
    const { landlordId, amount, destBank, destBankCode, destAccount, narration, iswRef, status, iswResponse } = req.body;
    const withdrawal = await Withdrawal.create({ landlordId, amount, destBank, destBankCode, destAccount, narration, iswRef, status: status || 'success', iswResponse });

    // Deduct from wallet on success
    if (withdrawal.status === 'success' && landlordId) {
      await EscrowWallet.findOneAndUpdate(
        { landlordId },
        { $inc: { balance: -amount, totalWithdrawn: amount } },
        { upsert: true }
      );
    }

    res.status(201).json(withdrawal);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/withdrawals?landlordId=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.landlordId) filter.landlordId = req.query.landlordId;
    const withdrawals = await Withdrawal.find(filter).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
