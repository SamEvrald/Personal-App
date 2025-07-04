// index.js (Associations - no changes needed here for underscored)
const User = require('./User');
const Project = require('./Project');
const Subproject = require('./Subproject');
const DailyEntry = require('./DailyEntry');
const ProofFile = require('./ProofFile');
const WeeklyReview = require('./WeeklyReview');
const JobApplication = require('./JobApplication');
const JobActivity = require('./JobActivity');

// Define associations
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Project.hasMany(Subproject, { foreignKey: 'projectId', as: 'subprojects' });
Subproject.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(DailyEntry, { foreignKey: 'userId', as: 'dailyEntries' });
DailyEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(DailyEntry, { foreignKey: 'projectId', as: 'dailyEntries' });
DailyEntry.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Subproject.hasMany(DailyEntry, { foreignKey: 'subprojectId', as: 'dailyEntries' });
DailyEntry.belongsTo(Subproject, { foreignKey: 'subprojectId', as: 'subproject' });

DailyEntry.hasMany(ProofFile, { foreignKey: 'dailyExecutionEntryId', as: 'proofFiles' });
ProofFile.belongsTo(DailyEntry, { foreignKey: 'dailyExecutionEntryId', as: 'dailyEntry' });

User.hasMany(WeeklyReview, { foreignKey: 'userId', as: 'weeklyReviews' });
WeeklyReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(WeeklyReview, { foreignKey: 'projectId', as: 'weeklyReviews' });
WeeklyReview.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Subproject.hasMany(WeeklyReview, { foreignKey: 'subprojectId', as: 'weeklyReviews' });
WeeklyReview.belongsTo(Subproject, { foreignKey: 'subprojectId', as: 'subproject' });

User.hasMany(JobApplication, { foreignKey: 'userId', as: 'jobApplications' });
JobApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

JobApplication.hasMany(JobActivity, { foreignKey: 'jobApplicationId', as: 'activities' });
JobActivity.belongsTo(JobApplication, { foreignKey: 'jobApplicationId', as: 'jobApplication' });

module.exports = {
  User,
  Project,
  Subproject,
  DailyEntry,
  ProofFile,
  WeeklyReview,
  JobApplication,
  JobActivity
};
