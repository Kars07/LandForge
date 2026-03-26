const { Schema, model } = require('mongoose');

const propertySchema = new Schema({
  landlordId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:          { type: String, required: true },
  description:    String,
  address:        String,
  city:           String,
  state:          String,
  price:          { type: Number, required: true },
  purpose:        { type: String, enum: ['sale', 'rent'], default: 'sale' },
  type:           String,
  bedrooms:       Number,
  bathrooms:      Number,
  images:         [String],
  status:         { type: String, enum: ['active', 'sold', 'rented', 'inactive'], default: 'active' },
  // Sui on-chain data
  suiListingId:   String,
  suiTxDigest:    String,
  documentHash:   String,
  fieldsHash:     String,
  // AI data
  aiVerified:     { type: Boolean, default: false },
  aiConfidence:   Number,
}, { timestamps: true });

module.exports = model('Property', propertySchema);
