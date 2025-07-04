const { Project, Subproject, DailyEntry, WeeklyReview } = require('../models');
const { Op } = require('sequelize'); // Ensure Op is imported

const projectController = {
  // Get all projects for a user
  getAll: async (req, res) => {
    try {
      const projects = await Project.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Subproject,
            as: 'subprojects'
          }
        ],
         order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching projects'
      });
    }
  },

  // Get single project
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        },
        include: [
          {
            model: Subproject,
            as: 'subprojects'
          },
          {
            model: DailyEntry,
            as: 'dailyEntries',
            limit: 10,
            order: [['entryDate', 'DESC']]
          },
          {
            model: WeeklyReview,
            as: 'weeklyReviews',
            limit: 5,
            order: [['weekStartDate', 'DESC']]
          }
        ]
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project'
      });
    }
  },

  // Create new project
  create: async (req, res) => {
    try {
      const { name, description, deadline, status, subprojects: subprojectNames } = req.body; // Destructure subprojectNames

      const project = await Project.create({
        userId: req.user.id,
        name,
        description,
        deadline,
        status
      });

      // Create subprojects if provided
      if (subprojectNames && subprojectNames.length > 0) {
        const subprojectData = subprojectNames.map((subName) => ({
          projectId: project.id,
          name: subName
        }));
        await Subproject.bulkCreate(subprojectData);
      }

      // Fetch the created project with its subprojects to return a complete object
      const createdProjectWithSubprojects = await Project.findByPk(project.id, {
        include: [
          {
            model: Subproject,
            as: 'subprojects'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: createdProjectWithSubprojects // Return the project with subprojects
      });
    } catch (error) {
      console.error('Create project error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating project'
      });
    }
  },

  // Update project
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, deadline, status } = req.body;

      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.update({
        name: name || project.name,
        description: description !== undefined ? description : project.description,
        deadline: deadline !== undefined ? deadline : project.deadline,
        status: status || project.status
      });

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating project'
      });
    }
  },

  // Delete project
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.destroy();

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting project'
      });
    }
  },

  // Create subproject
  createSubproject: async (req, res) => {
    try {
      const { id } = req.params; // project id
      const { name, description, status } = req.body;

      // Check if project exists and belongs to user
      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const subproject = await Subproject.create({
        projectId: id,
        name,
        description,
        status
      });

      res.status(201).json({
        success: true,
        message: 'Subproject created successfully',
        data: subproject
      });
    } catch (error) {
      console.error('Create subproject error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Subproject with this name already exists in this project'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating subproject'
      });
    }
  },

  // Update subproject
  updateSubproject: async (req, res) => {
    try {
      const { id, subprojectId } = req.params;
      const { name, description, status } = req.body;

      // Check if project exists and belongs to user
      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const subproject = await Subproject.findOne({
        where: {
          id: subprojectId,
          projectId: id
        }
      });

      if (!subproject) {
        return res.status(404).json({
          success: false,
          message: 'Subproject not found'
        });
      }

      await subproject.update({
        name: name || subproject.name,
        description: description !== undefined ? description : subproject.description,
        status: status || subproject.status
      });

      res.json({
        success: true,
        message: 'Subproject updated successfully',
        data: subproject
      });
    } catch (error) {
      console.error('Update subproject error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating subproject'
      });
    }
  },

  // Delete subproject
  deleteSubproject: async (req, res) => {
    try {
      const { id, subprojectId } = req.params;

      // Check if project exists and belongs to user
      const project = await Project.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const subproject = await Subproject.findOne({
        where: {
          id: subprojectId,
          projectId: id
        }
      });

      if (!subproject) {
        return res.status(404).json({
          success: false,
          message: 'Subproject not found'
        });
      }

      await subproject.destroy();

      res.json({
        success: true,
        message: 'Subproject deleted successfully'
      });
    } catch (error) {
      console.error('Delete subproject error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting subproject'
      });
    }
  }
};

module.exports = projectController;
