const { DailyEntry, Project, Subproject, ProofFile } = require('../models');
const { sequelize } = require('../config/database');
const path = require('path');
const { Op } = require('sequelize');

const dailyController = {
  // Get all daily entries for a user
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, projectId, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      
      if (projectId) {
        whereClause.projectId = projectId;
      }
      
      if (startDate && endDate) {
        whereClause.entryDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      const { count, rows: entries } = await DailyEntry.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'status', 'total_hours_logged'] // Include total_hours_logged here
          },
          {
            model: Subproject,
            as: 'subproject',
            attributes: ['name', 'status']
          },
          {
            model: ProofFile,
            as: 'proofFiles'
          }
        ],
        order: [['entry_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          entries,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get daily entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching daily entries'
      });
    }
  },

  // Get single daily entry
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const entry = await DailyEntry.findOne({
        where: { 
          id,
          userId: req.user.id 
        },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'status', 'total_hours_logged'] // Include total_hours_logged here
          },
          {
            model: Subproject,
            as: 'subproject'
          },
          {
            model: ProofFile,
            as: 'proofFiles'
          }
        ]
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Daily entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get daily entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching daily entry'
      });
    }
  },

  // Create new daily entry
  create: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        projectId,
        subprojectId,
        entryDate,
        dailyFocus,
        whatShippedToday,
        whatSlowedDown,
        whatToFixTomorrow,
        hoursSpent,
        proofLink
      } = req.body;

      // Verify project belongs to user
      const project = await Project.findOne({
        where: { 
          id: projectId,
          userId: req.user.id 
        }
      });

      if (!project) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Create daily entry
      const entry = await DailyEntry.create({
        userId: req.user.id,
        projectId,
        subprojectId,
        entryDate,
        dailyFocus,
        whatShippedToday,
        whatSlowedDown,
        whatToFixTomorrow,
        hoursSpent,
        proofLink
      }, { transaction });

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const proofFiles = req.files.map(file => ({
          dailyExecutionEntryId: entry.id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileUrl: `/uploads/${req.user.id}/${file.filename}`,
          storagePath: file.path
        }));

        await ProofFile.bulkCreate(proofFiles, { transaction });
      }

      await transaction.commit();

      // AFTER COMMIT, RE-FETCH THE PROJECT TO GET THE UPDATED total_hours_logged
      // This is crucial because the trigger runs AFTER the insert/update.
      const updatedProject = await Project.findByPk(projectId); 
      if (updatedProject) {
          // You might want to explicitly update the project object in the response if needed,
          // but the main goal is for the next projectsApi.getAll() call to get the correct value.
          // For now, the trigger handles the DB update.
      }


      // Fetch the created entry with associations (this is for the daily entry list, not project hours)
      const createdEntry = await DailyEntry.findByPk(entry.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'status', 'total_hours_logged'] // Ensure this is also included here
          },
          {
            model: Subproject,
            as: 'subproject'
          },
          {
            model: ProofFile,
            as: 'proofFiles'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Daily entry created successfully',
        data: createdEntry
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create daily entry error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error creating daily entry'
      });
    }
  },

  // Update daily entry
  update: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const {
        projectId,
        subprojectId,
        entryDate,
        dailyFocus,
        whatShippedToday,
        whatSlowedDown,
        whatToFixTomorrow,
        hoursSpent,
        proofLink
      } = req.body;

      const entry = await DailyEntry.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!entry) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Daily entry not found'
        });
      }

      // If projectId is being updated, verify new project belongs to user
      if (projectId && projectId !== entry.projectId) {
        const project = await Project.findOne({
          where: { 
            id: projectId,
            userId: req.user.id 
          }
        });

        if (!project) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: 'Project not found'
          });
        }
      }

      await entry.update({
        projectId: projectId || entry.projectId,
        subprojectId: subprojectId !== undefined ? subprojectId : entry.subprojectId,
        entryDate: entryDate || entry.entryDate,
        dailyFocus: dailyFocus !== undefined ? dailyFocus : entry.dailyFocus,
        whatShippedToday: whatShippedToday || entry.whatShippedToday,
        whatSlowedDown: whatSlowedDown !== undefined ? whatSlowedDown : entry.whatSlowedDown,
        whatToFixTomorrow: whatToFixTomorrow !== undefined ? whatToFixTomorrow : entry.whatToFixTomorrow,
        hoursSpent: hoursSpent || entry.hoursSpent,
        proofLink: proofLink !== undefined ? proofLink : entry.proofLink
      }, { transaction });

      // Handle new file uploads
      if (req.files && req.files.length > 0) {
        const proofFiles = req.files.map(file => ({
          dailyExecutionEntryId: entry.id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileUrl: `/uploads/${req.user.id}/${file.filename}`,
          storagePath: file.path
        }));

        await ProofFile.bulkCreate(proofFiles, { transaction });
      }

      await transaction.commit();

      // AFTER COMMIT, RE-FETCH THE PROJECT TO GET THE UPDATED total_hours_logged
      const updatedProject = await Project.findByPk(projectId);
      if (updatedProject) {
          // You might want to explicitly update the project object in the response if needed,
          // but the main goal is for the next projectsApi.getAll() call to get the correct value.
      }

      // Fetch updated entry with associations
      const updatedEntry = await DailyEntry.findByPk(entry.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'status', 'total_hours_logged'] // Ensure this is also included here
          },
          {
            model: Subproject,
            as: 'subproject'
          },
          {
            model: ProofFile,
            as: 'proofFiles'
          }
        ]
      });

      res.json({
        success: true,
        message: 'Daily entry updated successfully',
        data: updatedEntry
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update daily entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating daily entry'
      });
    }
  },

  // Delete daily entry
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const entry = await DailyEntry.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Daily entry not found'
        });
      }

      // Store projectId before deleting entry
      const deletedProjectId = entry.projectId;

      await entry.destroy();

      // AFTER DELETE, RE-FETCH THE PROJECT TO GET THE UPDATED total_hours_logged
      const updatedProject = await Project.findByPk(deletedProjectId);
      if (updatedProject) {
          // No direct response update needed here, but the trigger should have fired.
      }

      res.json({
        success: true,
        message: 'Daily entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete daily entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting daily entry'
      });
    }
  },

  // Delete proof file
  deleteProofFile: async (req, res) => {
    try {
      const { id, fileId } = req.params;

      // Verify entry belongs to user
      const entry = await DailyEntry.findOne({
        where: { 
          id,
          userId: req.user.id 
        }
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Daily entry not found'
        });
      }

      const proofFile = await ProofFile.findOne({
        where: { 
          id: fileId,
          dailyExecutionEntryId: id
        }
      });

      if (!proofFile) {
        return res.status(404).json({
          success: false,
          message: 'Proof file not found'
        });
      }

      // Delete file from filesystem
      const fs = require('fs');
      if (fs.existsSync(proofFile.storagePath)) {
        fs.unlinkSync(proofFile.storagePath);
      }

      await proofFile.destroy();

      // After deleting a proof file, the total_hours_logged for the project
      // is NOT affected, so no need to re-fetch the project here.

      res.json({
        success: true,
        message: 'Proof file deleted successfully'
      });
    } catch (error) {
      console.error('Delete proof file error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting proof file'
      });
    }
  }
};

module.exports = dailyController;
