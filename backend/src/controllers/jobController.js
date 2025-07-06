const { JobApplication, JobActivity } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database'); // sequelize is used in getStats, so keep this import

const jobController = {
  // Get all job applications for a user
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, company } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (company) {
        whereClause.companyName = {
          [Op.like]: `%${company}%`
        };
      }

      // FIX: Corrected typo from findAndAndCountAll to findAndCountAll
      const { count, rows: applications } = await JobApplication.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: JobActivity,
            as: 'activities',
            limit: 5,
            order: [['activityDate', 'DESC']]
          }
        ],
        order: [['applicationDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get job applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job applications'
      });
    }
  },

  // Get single job application
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        },
        include: [
          {
            model: JobActivity,
            as: 'activities',
            order: [['activityDate', 'DESC']]
          }
        ]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get job application error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job application'
      });
    }
  },

  // Create new job application
  create: async (req, res) => {
    try {
      const {
        companyName,
        positionTitle,
        jobDescription,
        applicationDate,
        status,
        applicationUrl,
        salaryRange,
        location,
        remoteOption,
        notes
      } = req.body;

      const application = await JobApplication.create({
        userId: req.user.id,
        companyName,
        positionTitle,
        jobDescription,
        applicationDate,
        status,
        applicationUrl,
        salaryRange,
        location,
        remoteOption,
        notes
      });

      // Create initial activity
      await JobActivity.create({
        jobApplicationId: application.id,
        activityType: 'application',
        activityDate: applicationDate,
        description: `Applied for ${positionTitle} position at ${companyName}`
      });

      // Fetch the created application with activities
      const createdApplication = await JobApplication.findByPk(application.id, {
        include: [
          {
            model: JobActivity,
            as: 'activities',
            order: [['activityDate', 'DESC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: createdApplication
      });
    } catch (error) {
      console.error('Create job application error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating job application'
      });
    }
  },

  // Update job application
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        companyName,
        positionTitle,
        jobDescription,
        applicationDate,
        status,
        applicationUrl,
        salaryRange,
        location,
        remoteOption,
        notes
      } = req.body;

      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      const oldStatus = application.status;
      
      await application.update({
        companyName: companyName || application.companyName,
        positionTitle: positionTitle || application.positionTitle,
        jobDescription: jobDescription !== undefined ? jobDescription : application.jobDescription,
        applicationDate: applicationDate || application.applicationDate,
        status: status || application.status,
        applicationUrl: applicationUrl !== undefined ? applicationUrl : application.applicationUrl,
        salaryRange: salaryRange !== undefined ? salaryRange : application.salaryRange,
        location: location !== undefined ? location : application.location,
        remoteOption: remoteOption !== undefined ? remoteOption : application.remoteOption,
        notes: notes !== undefined ? notes : application.notes
      });

      // If status changed, create activity
      if (status && status !== oldStatus) {
        // Map job application status to activity type for JobActivity ENUM
        const activityTypeMap = {
          'applied': 'application',
          'screening': 'phone_screen', 
          'interview': 'interview',
          'offer': 'offer',
          'rejected': 'rejection',   
          'withdrawn': 'withdrawal' 
        };

        const activityType = activityTypeMap[status];

        if (activityType) { 
          await JobActivity.create({
            jobApplicationId: application.id,
            activityType: activityType, 
            activityDate: new Date(), 
            description: `Status changed to ${status}`
          });
        }
      }

      // Fetch updated application with activities
      const updatedApplication = await JobApplication.findByPk(application.id, {
        include: [
          {
            model: JobActivity,
            as: 'activities',
            order: [['activityDate', 'DESC']]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Job application updated successfully',
        data: updatedApplication
      });
    } catch (error) {
      console.error('Update job application error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating job application'
      });
    }
  },

  // Delete job application
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      await application.destroy();

      res.json({
        success: true,
        message: 'Job application deleted successfully'
      });
    } catch (error) {
      console.error('Delete job application error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting job application'
      });
    }
  },

  // Add activity to job application
  addActivity: async (req, res) => {
    try {
      const { id } = req.params; // job application id
      const {
        activityType,
        activityDate,
        description,
        contactPerson,
        notes
      } = req.body;

      // Verify job application belongs to user
      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      const activity = await JobActivity.create({
        jobApplicationId: id,
        activityType,
        activityDate,
        description,
        contactPerson,
        notes
      });

      // Update application status if activity indicates status change
      const statusMap = {
        'phone_screen': 'screening',
        'interview': 'interview',
        'offer': 'offer',
        'rejection': 'rejected',
        'withdrawal': 'withdrawn'
      };

      if (statusMap[activityType]) {
        await application.update({ status: statusMap[activityType] });
      }

      res.status(201).json({
        success: true,
        message: 'Activity added successfully',
        data: activity
      });
    } catch (error) {
      console.error('Add activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding activity'
      });
    }
  },

  // Update activity
  updateActivity: async (req, res) => {
    try {
      const { id, activityId } = req.params;
      const {
        activityType,
        activityDate,
        description,
        contactPerson,
        notes
      } = req.body;

      // Verify job application belongs to user
      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      const activity = await JobActivity.findOne({
        where: { 
          id: activityId,
          jobApplicationId: id
        }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      await activity.update({
        activityType: activityType || activity.activityType,
        activityDate: activityDate || activity.activityDate,
        description: description !== undefined ? description : activity.description,
        contactPerson: contactPerson !== undefined ? contactPerson : activity.contactPerson,
        notes: notes !== undefined ? notes : activity.notes
      });

      res.json({
        success: true,
        message: 'Activity updated successfully',
        data: activity
      });
    } catch (error) {
      console.error('Update activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating activity'
      });
    }
  },

  // Delete activity
  deleteActivity: async (req, res) => {
    try {
      const { id, activityId } = req.params;

      // Verify job application belongs to user
      const application = await JobApplication.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      const activity = await JobActivity.findOne({
        where: { 
          id: activityId,
          jobApplicationId: id
        }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      await activity.destroy();

      res.json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (error) {
      console.error('Delete activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting activity'
      });
    }
  },

  // Get job application statistics
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const stats = await JobApplication.findAll({
        where: { userId },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('status')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const totalApplications = await JobApplication.count({
        where: { userId }
      });

      const monthlyStats = await JobApplication.findAll({
        where: {
          userId,
          applicationDate: {
            [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 12 MONTH)')
          }
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('application_date'), '%Y-%m'), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('application_date'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('application_date'), '%Y-%m'), 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          totalApplications,
          statusStats: stats,
          monthlyStats
        }
      });
    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job statistics'
      });
    }
  }
};

module.exports = jobController;
