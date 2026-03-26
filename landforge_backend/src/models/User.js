const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  role:         { type: String, enum: ['buyer', 'landlord'], required: true },
  accountType:  { type: String, enum: ['personal', 'business'], default: 'personal' },
  businessName: String,
  buyerPreference: { type: String, enum: ['buy', 'rent', 'both'], default: 'both' },
  nin:          String,
  ninVerified:  { type: Boolean, default: false },
  bvn:          String,
  bvnVerified:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('User', userSchema);
