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
    // Change deadline to Joi.string() if sending ISO string, or keep Joi.date() if Joi handles Date objects well
    // For consistency with how dates are sent to backend (e.g., dailyEntry), string is safer.
    deadline: Joi.string().isoDate().optional().allow(null, ''), // Allow empty string or null for optional date
    status: Joi.string().valid('active', 'completed', 'paused', 'cancelled').optional(),
    // ADD THIS LINE: Allow subprojects as an array of strings
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
    subprojectId: Joi.string().uuid().optional(),
    weekStartDate: Joi.date().required(),
    whatShipped: Joi.string().required(),
    whatFailedToDeliver: Joi.string().optional(),
    whatDistracted: Joi.string().optional(),
    whatLearned: Joi.string().required(),
    hoursSpent: Joi.number().positive().required()
  }),
  
  jobApplication: Joi.object({
    companyName: Joi.string().required(),
    positionTitle: Joi.string().required(),
    jobDescription: Joi.string().optional(),
    applicationDate: Joi.date().required(),
    status: Joi.string().valid('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn').optional(),
    applicationUrl: Joi.string().uri().optional(),
    salaryRange: Joi.string().optional(),
    location: Joi.string().optional(),
    remoteOption: Joi.boolean().optional(),
    notes: Joi.string().optional()
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
