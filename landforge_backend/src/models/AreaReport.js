const { Schema, model } = require('mongoose');

const areaReportSchema = new Schema({
  location:    { type: String, required: true },
  propertyId:  { type: Schema.Types.ObjectId, ref: 'Property' },
  reportText:  { type: String, required: true },
  generatedBy: { type: String, default: 'landforge_area_intelligence' },
}, { timestamps: true });

// Index on location for fast cache lookups
areaReportSchema.index({ location: 1 });

module.exports = model('AreaReport', areaReportSchema);
