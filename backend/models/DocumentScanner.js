const mongoose = require('mongoose');

const documentScannerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['prescription', 'lab-report', 'medical-certificate', 'insurance-card', 'vaccination-card', 'bill', 'other'],
    required: true
  },
  originalImage: {
    type: String, // URL/path to original image
    required: true
  },
  processedImage: String,
  extractedData: {
    text: String, // Raw OCR text
    structured: mongoose.Schema.Types.Mixed, // Parsed structured data
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    testResults: [{
      test: String,
      value: String,
      unit: String,
      normalRange: String
    }],
    doctorName: String,
    hospitalName: String,
    date: Date,
    patientName: String,
    diagnosis: String,
    instructions: String,
    confidence: Number // OCR confidence score
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingTime: Number, // in milliseconds
  errorMessage: String,
  tags: [String],
  notes: String,
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Index for faster searches
documentScannerSchema.index({ user: 1, documentType: 1 });
documentScannerSchema.index({ 'extractedData.date': -1 });

module.exports = mongoose.model('DocumentScanner', documentScannerSchema);
