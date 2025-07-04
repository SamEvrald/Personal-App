
const { WeeklyReview, Project, Subproject } = require('../models');
const { Op } = require('sequelize');

const weeklyController = {
  // Get all weekly reviews for a user
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, projectId, year } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      
      if (projectId) {
        whereClause.projectId = projectId;
      }
      
      if (year) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        whereClause.weekStartDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      const { count, rows: reviews } = await WeeklyReview.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'status']
          },
          {
            model: Subproject,
            as: 'subproject',
            attributes: ['name', 'status']
          }
        ],
        order: [['weekStartDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get weekly reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching weekly reviews'
      });
    }
  },

  // Get single weekly review
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await WeeklyReview.findOne({
        where: { 
          id,
          userId: req.user.id 
        },
        include: [
          {
            model: Project,
            as: 'project'
          },
          {
            model: Subproject,
            as: 'subproject'
          }
        ]
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Weekly review not found'
        });
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      console.error('Get weekly review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching weekly review'
      });
    }
  },

  // Create new weekly review
  create: async (req, res) => {
    try {
      const {
        projectId,
        subprojectId,
        weekStartDate,
        whatShipped,
        whatFailedToDeliver,
        whatDistracted,
        whatLearned,
        hoursSpent
      } = req.body;

      // Verify project belongs to user
      const project = await Project.findOne({
        where: { 
          id: projectId,
          userId: req.user.id 
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const review = await WeeklyReview.create({
        userId: req.user.id,
        projectId,
        subprojectId,
        weekStartDate,
        whatShipped,
        whatFailedToDeliver,
        whatDistracted,
        whatLearned,
        hoursSpent
      });

      // Fetch the created review with associations
      const createdReview = await WeeklyReview.findByPk(review.id, {
        include: [
          {
            model: Project,
            as: 'project'
          },
          {
            model: Subproject,
            as: 'subproject'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Weekly review created successfully',
        data: createdReview
      });
    } catch (error) {
      console.error('Create weekly review error:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Weekly review for this project and week already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating weekly review'
      });
    }
  },

  // Update weekly review
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        projectId,
        subprojectId,
        weekStartDate,
        whatShipped,
        whatFailedToDeliver,
        whatDistracted,
        whatLearned,
        hoursSpent
      } = req.body;

      const review = await WeeklyReview.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Weekly review not found'
        });
      }

      // If projectId is being updated, verify new project belongs to user
      if (projectId && projectId !== review.projectId) {
        const project = await Project.findOne({
          where: { 
            id: projectId,
            userId: req.user.id 
          }
        });

        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Project not found'
          });
        }
      }

      await review.update({
        projectId: projectId || review.projectId,
        subprojectId: subprojectId !== undefined ? subprojectId : review.subprojectId,
        weekStartDate: weekStartDate || review.weekStartDate,
        whatShipped: whatShipped || review.whatShipped,
        whatFailedToDeliver: whatFailedToDeliver !== undefined ? whatFailedToDeliver : review.whatFailedToDeliver,
        whatDistracted: whatDistracted !== undefined ? whatDistracted : review.whatDistracted,
        whatLearned: whatLearned || review.whatLearned,
        hoursSpent: hoursSpent || review.hoursSpent
      });

      // Fetch updated review with associations
      const updatedReview = await WeeklyReview.findByPk(review.id, {
        include: [
          {
            model: Project,
            as: 'project'
          },
          {
            model: Subproject,
            as: 'subproject'
          }
        ]
      });

      res.json({
        success: true,
        message: 'Weekly review updated successfully',
        data: updatedReview
      });
    } catch (error) {
      console.error('Update weekly review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating weekly review'
      });
    }
  },

  // Delete weekly review
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await WeeklyReview.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Weekly review not found'
        });
      }

      await review.destroy();

      res.json({
        success: true,
        message: 'Weekly review deleted successfully'
      });
    } catch (error) {
      console.error('Delete weekly review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting weekly review'
      });
    }
  }
};

module.exports = weeklyController;
