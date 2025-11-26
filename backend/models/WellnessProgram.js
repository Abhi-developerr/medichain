const mongoose = require('mongoose');

const wellnessProgramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  programType: {
    type: String,
    enum: ['fitness-challenge', 'nutrition-plan', 'meditation', 'weight-loss', 'stress-management', 'sleep-improvement', 'custom'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  duration: Number, // in days
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  goals: [{
    title: String,
    target: Number,
    unit: String,
    achieved: {
      type: Boolean,
      default: false
    },
    progress: Number
  }],
  dailyTasks: [{
    day: Number,
    tasks: [{
      title: String,
      description: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }]
  }],
  nutritionPlan: {
    calorieTarget: Number,
    proteinTarget: Number,
    carbsTarget: Number,
    fatTarget: Number,
    waterIntake: Number, // in liters
    meals: [{
      date: Date,
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
      },
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      description: String,
      photo: String
    }]
  },
  workoutPlan: {
    weeklyTarget: Number, // workouts per week
    workouts: [{
      date: Date,
      type: String, // cardio, strength, yoga, etc.
      duration: Number, // in minutes
      caloriesBurned: Number,
      notes: String,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  meditationLog: [{
    date: Date,
    duration: Number, // in minutes
    technique: String,
    notes: String
  }],
  sleepLog: [{
    date: Date,
    sleepTime: Date,
    wakeTime: Date,
    duration: Number, // in hours
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    },
    notes: String
  }],
  progress: {
    completionRate: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date,
    description: String
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    times: [String] // ["08:00", "12:00", "18:00"]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    status: String
  }]
}, { 
  timestamps: true 
});

// Calculate completion rate
wellnessProgramSchema.methods.calculateProgress = function() {
  let totalTasks = 0;
  let completedTasks = 0;
  
  this.dailyTasks.forEach(day => {
    day.tasks.forEach(task => {
      totalTasks++;
      if (task.completed) completedTasks++;
    });
  });
  
  this.progress.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return this.progress.completionRate;
};

module.exports = mongoose.model('WellnessProgram', wellnessProgramSchema);
