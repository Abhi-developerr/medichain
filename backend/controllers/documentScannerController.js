const DocumentScanner = require('../models/DocumentScanner');

// Simulated OCR processing (in production, integrate with Google Vision API, Tesseract, or AWS Textract)
const processDocument = async (imageUrl, documentType) => {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulated extracted data based on document type
  const mockData = {
    prescription: {
      text: 'Dr. John Smith\nPrescription\nPatient: John Doe\nMedication: Amoxicillin 500mg\nDosage: 1 tablet three times daily\nDuration: 7 days',
      structured: {},
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' }
      ],
      doctorName: 'Dr. John Smith',
      date: new Date(),
      confidence: 0.92
    },
    'lab-report': {
      text: 'Lab Test Results\nHemoglobin: 14.5 g/dL\nWBC: 7500 cells/mcL\nGlucose: 95 mg/dL',
      structured: {},
      testResults: [
        { test: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRange: '13.5-17.5' },
        { test: 'WBC', value: '7500', unit: 'cells/mcL', normalRange: '4500-11000' },
        { test: 'Glucose', value: '95', unit: 'mg/dL', normalRange: '70-100' }
      ],
      hospitalName: 'City Medical Lab',
      date: new Date(),
      confidence: 0.88
    }
  };
  
  return mockData[documentType] || {
    text: 'Document scanned successfully',
    confidence: 0.75
  };
};

// Upload and scan document
exports.scanDocument = async (req, res) => {
  try {
    const { documentType, imageUrl, notes } = req.body;
    
    const document = await DocumentScanner.create({
      user: req.user._id,
      documentType,
      originalImage: imageUrl,
      notes,
      status: 'processing'
    });
    
    // Process document asynchronously
    const startTime = Date.now();
    const extractedData = await processDocument(imageUrl, documentType);
    const processingTime = Date.now() - startTime;
    
    document.extractedData = extractedData;
    document.status = 'completed';
    document.processingTime = processingTime;
    
    await document.save();
    
    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all scanned documents
exports.getDocuments = async (req, res) => {
  try {
    const { documentType, verified } = req.query;
    const filter = { user: req.user._id };
    
    if (documentType) filter.documentType = documentType;
    if (verified !== undefined) filter.verified = verified === 'true';
    
    const documents = await DocumentScanner.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const document = await DocumentScanner.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const document = await DocumentScanner.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await DocumentScanner.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify document (for doctors/admin)
exports.verifyDocument = async (req, res) => {
  try {
    const document = await DocumentScanner.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    document.verified = true;
    document.verifiedBy = req.user._id;
    
    await document.save();
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const documents = await DocumentScanner.find({ user: req.user._id });
    
    const stats = {
      total: documents.length,
      byType: {},
      verified: documents.filter(d => d.verified).length,
      pending: documents.filter(d => d.status === 'pending').length,
      completed: documents.filter(d => d.status === 'completed').length,
      failed: documents.filter(d => d.status === 'failed').length,
      averageConfidence: documents
        .filter(d => d.extractedData?.confidence)
        .reduce((sum, d) => sum + d.extractedData.confidence, 0) / documents.length || 0
    };
    
    // Count by document type
    documents.forEach(doc => {
      stats.byType[doc.documentType] = (stats.byType[doc.documentType] || 0) + 1;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
