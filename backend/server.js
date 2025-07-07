
const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const cors = require('cors'); 

app.use(cors()); // For now, allow all origins for initial testing, then restrict

app.use(express.json()); 

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
