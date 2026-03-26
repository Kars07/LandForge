const { Schema, model } = require('mongoose');

const suiEventSchema = new Schema({
  txDigest:     { type: String, required: true, unique: true },
  eventSeq:     String,
  packageId:    String,
  module:       String,
  sender:       String,
  eventType:    { type: String, enum: ['registerListing', 'purchaseListing', 'verifyDocument', 'other'], default: 'other' },
  parsedJson:   Schema.Types.Mixed,
  // LandForge references
  propertyId:   { type: Schema.Types.ObjectId, ref: 'Property' },
  paymentId:    { type: Schema.Types.ObjectId, ref: 'Payment' },
  userId:       { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = model('SuiTransaction', suiEventSchema);
