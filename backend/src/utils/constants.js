
const constants = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // Project Status
  PROJECT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    CANCELLED: 'cancelled'
  },

  // Subproject Status
  SUBPROJECT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused'
  },

  // Job Application Status
  JOB_STATUS: {
    APPLIED: 'applied',
    SCREENING: 'screening',
    INTERVIEW: 'interview',
    OFFER: 'offer',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn'
  },

  // Job Activity Types
  ACTIVITY_TYPES: {
    APPLICATION: 'application',
    FOLLOW_UP: 'follow_up',
    PHONE_SCREEN: 'phone_screen',
    INTERVIEW: 'interview',
    OFFER: 'offer',
    REJECTION: 'rejection',
    WITHDRAWAL: 'withdrawal'
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10485760, // 10MB in bytes
    MAX_FILES: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.webm']
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // JWT
  JWT: {
    DEFAULT_EXPIRE: '30d',
    PRODUCTION_EXPIRE: '7d'
  },

  // Database
  DATABASE: {
    CONNECTION_TIMEOUT: 30000,
    IDLE_TIMEOUT: 10000,
    MAX_CONNECTIONS: 10,
    MIN_CONNECTIONS: 0
  },

  // Error Messages
  ERROR_MESSAGES: {
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Access denied. No token provided.',
    INVALID_TOKEN: 'Invalid token',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'User with this email already exists',
    PROJECT_NOT_FOUND: 'Project not found',
    SUBPROJECT_NOT_FOUND: 'Subproject not found',
    DAILY_ENTRY_NOT_FOUND: 'Daily entry not found',
    WEEKLY_REVIEW_NOT_FOUND: 'Weekly review not found',
    JOB_APPLICATION_NOT_FOUND: 'Job application not found',
    ACTIVITY_NOT_FOUND: 'Activity not found',
    FILE_NOT_FOUND: 'File not found',
    DUPLICATE_ENTRY: 'Entry already exists',
    SERVER_ERROR: 'Internal server error'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PROJECT_CREATED: 'Project created successfully',
    PROJECT_UPDATED: 'Project updated successfully',
    PROJECT_DELETED: 'Project deleted successfully',
    SUBPROJECT_CREATED: 'Subproject created successfully',
    SUBPROJECT_UPDATED: 'Subproject updated successfully',
    SUBPROJECT_DELETED: 'Subproject deleted successfully',
    DAILY_ENTRY_CREATED: 'Daily entry created successfully',
    DAILY_ENTRY_UPDATED: 'Daily entry updated successfully',
    DAILY_ENTRY_DELETED: 'Daily entry deleted successfully',
    WEEKLY_REVIEW_CREATED: 'Weekly review created successfully',
    WEEKLY_REVIEW_UPDATED: 'Weekly review updated successfully',
    WEEKLY_REVIEW_DELETED: 'Weekly review deleted successfully',
    JOB_APPLICATION_CREATED: 'Job application created successfully',
    JOB_APPLICATION_UPDATED: 'Job application updated successfully',
    JOB_APPLICATION_DELETED: 'Job application deleted successfully',
    ACTIVITY_ADDED: 'Activity added successfully',
    ACTIVITY_UPDATED: 'Activity updated successfully',
    ACTIVITY_DELETED: 'Activity deleted successfully',
    FILE_UPLOADED: 'File uploaded successfully',
    FILE_DELETED: 'File deleted successfully'
  },

  // Regex Patterns
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
    URL: /^https?:\/\/.+/
  }
};

module.exports = constants;
