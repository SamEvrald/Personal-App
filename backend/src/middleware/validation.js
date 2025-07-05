const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  project: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    deadline: Joi.string().isoDate().optional().allow(null, ''),
    status: Joi.string().valid('active', 'completed', 'paused', 'cancelled').optional(),
    subprojects: Joi.array().items(Joi.string()).optional()
  }),
  
  subproject: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    status: Joi.string().valid('active', 'completed', 'paused').optional()
  }),
  
  dailyEntry: Joi.object({
    projectId: Joi.string().uuid().required(),
    subprojectId: Joi.string().uuid().optional(),
    entryDate: Joi.date().required(),
    dailyFocus: Joi.boolean().optional(),
    whatShippedToday: Joi.string().required(),
    whatSlowedDown: Joi.string().optional(),
    whatToFixTomorrow: Joi.string().optional(),
    hoursSpent: Joi.number().positive().required(),
    proofLink: Joi.string().uri().optional()
  }),
  
  weeklyReview: Joi.object({
    projectId: Joi.string().uuid().required(),
    subprojectId: Joi.string().uuid().optional().allow(null, ''),
    weekStartDate: Joi.date().required(),
    whatShipped: Joi.string().optional().allow(''),
    whatFailedToDeliver: Joi.string().optional().allow(''),
    whatDistracted: Joi.string().optional().allow(''),
    whatLearned: Joi.string().optional().allow(''),
    hoursSpent: Joi.number().positive().required()
  }),
  
  jobApplication: Joi.object({
    companyName: Joi.string().required(),
    positionTitle: Joi.string().required(),
    // --- ENSURE THESE HAVE .allow(null, '') ---
    jobDescription: Joi.string().optional().allow(null, ''), 
    applicationDate: Joi.date().required(),
    status: Joi.string().valid('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn').optional(),
    applicationUrl: Joi.string().uri().optional().allow(null, ''), 
    salaryRange: Joi.string().optional().allow(null, ''), 
    location: Joi.string().optional().allow(null, ''), 
    remoteOption: Joi.boolean().optional(),
    notes: Joi.string().optional().allow(null, '') 
  }),
  
  jobActivity: Joi.object({
    activityType: Joi.string().valid('application', 'follow_up', 'phone_screen', 'interview', 'offer', 'rejection', 'withdrawal').required(),
    activityDate: Joi.date().required(),
    description: Joi.string().optional(),
    contactPerson: Joi.string().optional(),
    notes: Joi.string().optional()
  })
};

module.exports = { validate, schemas };
