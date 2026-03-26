const { Schema, model } = require('mongoose');

const withdrawalSchema = new Schema({
  landlordId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount:       { type: Number, required: true },
  destBank:     String,
  destBankCode: String,
  destAccount:  String,
  narration:    String,
  iswRef:       String,
  status:       { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  iswResponse:  Schema.Types.Mixed,
}, { timestamps: true });

module.exports = model('Withdrawal', withdrawalSchema);
