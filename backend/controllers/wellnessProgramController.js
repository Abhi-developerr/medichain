const WellnessProgram = require('../models/WellnessProgram');

// Get all wellness programs
exports.getPrograms = async (req, res) => {
  try {
    const programs = await WellnessProgram.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new program
exports.createProgram = async (req, res) => {
  try {
    const program = await WellnessProgram.create({
      ...req.body,
      user: req.user._id
    });
    
    res.status(201).json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single program
exports.getProgram = async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update program
exports.updateProgram = async (req, res) => {
  try {
    const program = await WellnessProgram.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await WellnessProgram.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log meal
exports.logMeal = async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.nutritionPlan.meals.push(req.body);
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log workout
exports.logWorkout = async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.workoutPlan.workouts.push({ ...req.body, completed: true });
    
    // Update streak
    program.progress.currentStreak += 1;
    if (program.progress.currentStreak > program.progress.longestStreak) {
      program.progress.longestStreak = program.progress.currentStreak;
    }
    
    // Award points
    program.progress.totalPoints += 10;
    
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log meditation
exports.logMeditation = async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.meditationLog.push(req.body);
    program.progress.totalPoints += 5;
    
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log sleep
exports.logSleep = async (req, res) => {
  try {
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.sleepLog.push(req.body);
    program.progress.totalPoints += 3;
    
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete task
exports.completeTask = async (req, res) => {
  try {
    const { dayIndex, taskIndex } = req.body;
    
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    const task = program.dailyTasks[dayIndex].tasks[taskIndex];
    task.completed = true;
    task.completedAt = new Date();
    
    program.progress.totalPoints += 5;
    program.calculateProgress();
    
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Award badge
exports.awardBadge = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    
    const program = await WellnessProgram.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.badges.push({
      name,
      icon,
      description,
      earnedAt: new Date()
    });
    
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const programs = await WellnessProgram.find({ user: req.user._id });
    
    const stats = {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.status === 'active').length,
      completedPrograms: programs.filter(p => p.status === 'completed').length,
      totalPoints: programs.reduce((sum, p) => sum + p.progress.totalPoints, 0),
      totalBadges: programs.reduce((sum, p) => sum + p.badges.length, 0),
      longestStreak: Math.max(...programs.map(p => p.progress.longestStreak), 0),
      averageCompletion: programs.reduce((sum, p) => sum + p.progress.completionRate, 0) / programs.length || 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
