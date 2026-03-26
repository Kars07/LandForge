const { Schema, model } = require('mongoose');

const walletSchema = new Schema({
  landlordId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  iswAccountNumber: String,
  iswAccountName:   String,
  iswBankName:      String,
  iswPayableId:     String,
  iswMerchantCode:  String,
  balance:          { type: Number, default: 0 },
  totalReceived:    { type: Number, default: 0 },
  totalWithdrawn:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('EscrowWallet', walletSchema);
