const HealthGoal = require('../models/HealthGoal');

// Get all health goals for a user
exports.getHealthGoals = async (req, res) => {
  try {
    const goals = await HealthGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new health goal
exports.createHealthGoal = async (req, res) => {
  try {
    const { title, category, description, targetValue, unit, targetDate, reminders } = req.body;

    const goal = new HealthGoal({
      user: req.user._id,
      title,
      category,
      description,
      targetValue,
      unit,
      targetDate,
      reminders
    });

    await goal.save();
    res.status(201).json({ message: 'Health goal created successfully', goal });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create health goal', error: error.message });
  }
};

// Update goal progress
exports.updateProgress = async (req, res) => {
  try {
    const { value, note } = req.body;
    const goal = await HealthGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    goal.progress.push({ value, note, date: new Date() });
    goal.currentValue = value;

    // Auto-complete if target reached
    if (value >= goal.targetValue) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json({ message: 'Progress updated successfully', goal });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update progress', error: error.message });
  }
};

// Update goal status
exports.updateGoalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const goal = await HealthGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    goal.status = status;
    await goal.save();

    res.json({ message: 'Goal status updated successfully', goal });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update goal status', error: error.message });
  }
};

// Delete a health goal
exports.deleteHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    res.json({ message: 'Health goal deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete health goal', error: error.message });
  }
};

// Get goal statistics
exports.getGoalStats = async (req, res) => {
  try {
    const goals = await HealthGoal.find({ user: req.user._id });

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      abandoned: goals.filter(g => g.status === 'abandoned').length,
      byCategory: {}
    };

    // Count by category
    goals.forEach(goal => {
      stats.byCategory[goal.category] = (stats.byCategory[goal.category] || 0) + 1;
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
