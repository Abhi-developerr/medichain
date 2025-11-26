const HealthRecord = require('../models/HealthRecord');

// Get all records for user
exports.getRecords = async (req, res) => {
  try {
    const query = { user: req.params.userId || req.user._id };
    
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }
    
    const records = await HealthRecord.find(query)
      .populate('updatedBy', 'name role')
      .sort({ lastUpdated: -1 });
    
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get or create record by type
exports.getRecordByType = async (req, res) => {
  try {
    let record = await HealthRecord.findOne({
      user: req.user._id,
      recordType: req.params.type
    });
    
    if (!record) {
      record = await HealthRecord.create({
        user: req.user._id,
        recordType: req.params.type
      });
    }
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update record
exports.updateRecord = async (req, res) => {
  try {
    let record = await HealthRecord.findOne({
      user: req.user._id,
      recordType: req.params.type
    });
    
    if (!record) {
      record = await HealthRecord.create({
        user: req.user._id,
        recordType: req.params.type,
        ...req.body,
        updatedBy: req.user._id
      });
    } else {
      Object.assign(record, req.body);
      record.updatedBy = req.user._id;
      await record.save();
    }
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to array field (medications, allergies, etc.)
exports.addToArray = async (req, res) => {
  try {
    const { recordType, field, data } = req.body;
    
    let record = await HealthRecord.findOne({
      user: req.user._id,
      recordType
    });
    
    if (!record) {
      record = await HealthRecord.create({
        user: req.user._id,
        recordType
      });
    }
    
    const fieldPath = field.split('.');
    let target = record;
    
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!target[fieldPath[i]]) target[fieldPath[i]] = {};
      target = target[fieldPath[i]];
    }
    
    const arrayField = fieldPath[fieldPath.length - 1];
    if (!Array.isArray(target[arrayField])) {
      target[arrayField] = [];
    }
    
    target[arrayField].push(data);
    record.updatedBy = req.user._id;
    await record.save();
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from array field
exports.removeFromArray = async (req, res) => {
  try {
    const { recordType, field, itemId } = req.body;
    
    const record = await HealthRecord.findOne({
      user: req.user._id,
      recordType
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    const fieldPath = field.split('.');
    let target = record;
    
    for (let i = 0; i < fieldPath.length - 1; i++) {
      target = target[fieldPath[i]];
    }
    
    const arrayField = fieldPath[fieldPath.length - 1];
    target[arrayField].id(itemId).deleteOne();
    
    record.updatedBy = req.user._id;
    await record.save();
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get summary
exports.getSummary = async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id });
    
    const summary = {
      personalInfo: records.find(r => r.recordType === 'personal-info')?.personalInfo || {},
      chronicConditions: records.find(r => r.recordType === 'medical-history')?.medicalHistory?.chronicConditions || [],
      currentMedications: records.find(r => r.recordType === 'medical-history')?.medicalHistory?.currentMedications || [],
      allergies: records.find(r => r.recordType === 'medical-history')?.medicalHistory?.allergies || [],
      surgicalHistory: records.find(r => r.recordType === 'surgical-history')?.surgicalHistory || [],
      lastUpdated: Math.max(...records.map(r => r.lastUpdated.getTime()))
    };
    
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
