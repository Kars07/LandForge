const { Schema, model } = require('mongoose');

const paymentSchema = new Schema({
  buyerId:      { type: Schema.Types.ObjectId, ref: 'User' },
  propertyId:   { type: Schema.Types.ObjectId, ref: 'Property' },
  landlordId:   { type: Schema.Types.ObjectId, ref: 'User' },
  iswTxnRef:    { type: String, required: true, unique: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'NGN' },
  purpose:      { type: String, enum: ['purchase', 'rent'], default: 'purchase' },
  status:       { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  iswResponse:  Schema.Types.Mixed,
  // Sui on-chain transfer
  suiTxDigest:  String,
  suiListingId: String,
  onChainSettled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('Payment', paymentSchema);
