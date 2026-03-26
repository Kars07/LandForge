const router = require('express').Router();
const EscrowWallet = require('../models/EscrowWallet');

// GET /api/wallet/:landlordId
router.get('/:landlordId', async (req, res) => {
  try {
    const wallet = await EscrowWallet.findOne({ landlordId: req.params.landlordId });
    if (!wallet) return res.json({ balance: 0, totalReceived: 0, totalWithdrawn: 0, landlordId: req.params.landlordId });
    res.json(wallet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wallet — provision or update virtual account details
router.post('/', async (req, res) => {
  try {
    const { landlordId, iswAccountNumber, iswAccountName, iswBankName, iswPayableId, iswMerchantCode } = req.body;
    const wallet = await EscrowWallet.findOneAndUpdate(
      { landlordId },
      { iswAccountNumber, iswAccountName, iswBankName, iswPayableId, iswMerchantCode },
      { upsert: true, new: true }
    );
    res.status(201).json(wallet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
