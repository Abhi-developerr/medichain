const LabTest = require('../models/LabTest');
const mongoose = require('mongoose');

// Get all lab tests for a patient
exports.getLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find({ patient: req.user._id })
      .sort({ testDate: -1 });
    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new lab test
exports.createLabTest = async (req, res) => {
  try {
    const { testName, testType, labName, testDate, results, overallStatus, doctorNotes, nextTestDate } = req.body;

    // Check for critical values
    const hasCritical = results?.some(r => r.status === 'critical');

    const labTest = new LabTest({
      patient: req.user._id,
      testName,
      testType,
      labName,
      testDate,
      results,
      overallStatus,
      doctorNotes,
      nextTestDate,
      criticalFlag: hasCritical
    });

    await labTest.save();
    res.status(201).json({ message: 'Lab test created successfully', labTest });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create lab test', error: error.message });
  }
};

// Get a single lab test
exports.getLabTest = async (req, res) => {
  try {
    const test = await LabTest.findOne({ _id: req.params.id, patient: req.user._id });

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lab test
exports.updateLabTest = async (req, res) => {
  try {
    const test = await LabTest.findOne({ _id: req.params.id, patient: req.user._id });

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    Object.assign(test, req.body);

    // Re-check for critical values
    const hasCritical = test.results?.some(r => r.status === 'critical');
    test.criticalFlag = hasCritical;

    await test.save();
    res.json({ message: 'Lab test updated successfully', test });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update lab test', error: error.message });
  }
};

// Delete lab test
exports.deleteLabTest = async (req, res) => {
  try {
    const test = await LabTest.findOneAndDelete({ _id: req.params.id, patient: req.user._id });

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete lab test', error: error.message });
  }
};

// Get lab test statistics
exports.getLabTestStats = async (req, res) => {
  try {
    const tests = await LabTest.find({ patient: req.user._id });

    const stats = {
      total: tests.length,
      normal: tests.filter(t => t.overallStatus === 'normal').length,
      abnormal: tests.filter(t => t.overallStatus === 'abnormal').length,
      critical: tests.filter(t => t.criticalFlag).length,
      pending: tests.filter(t => t.overallStatus === 'pending').length,
      byType: {},
      recentTests: tests.slice(0, 5)
    };

    // Count by type
    tests.forEach(test => {
      stats.byType[test.testType] = (stats.byType[test.testType] || 0) + 1;
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get critical lab tests
exports.getCriticalTests = async (req, res) => {
  try {
    const criticalTests = await LabTest.find({ 
      patient: req.user._id, 
      criticalFlag: true 
    }).sort({ testDate: -1 });

    res.json({ criticalTests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
