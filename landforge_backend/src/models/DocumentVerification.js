const { Schema, model } = require('mongoose');

const verificationSchema = new Schema({
  propertyId:     { type: Schema.Types.ObjectId, ref: 'Property' },
  landlordId:     { type: Schema.Types.ObjectId, ref: 'User' },
  documentType:   { type: String, default: 'title_deed' },
  isVerified:     { type: Boolean, required: true },
  confidence:     Number,
  documentHash:   String,
  fieldsHash:     String,
  extractedFields: { type: Schema.Types.Mixed, default: {} },
  natRawResponse: Schema.Types.Mixed,
}, { timestamps: true });

module.exports = model('DocumentVerification', verificationSchema);
