
# Apply & Achieve - Job Application Tracker

A comprehensive job application tracking and productivity management system designed to help job seekers (in the phase of development it was myself) stay organized, track their progress, and achieve their career goals.

## Features

### Core Functionality
- **Job Application Tracking**: Track job applications across multiple platforms (Upwork, Toptal, LinkedIn, etc.)
- **Application Status Management**: Monitor progress from "Applied" to "Interviewing" to "Offer"
- **Weekly Progress Reviews**: Reflect on what was accomplished, what failed, and lessons learned
- **Daily Execution Planning**: Set and track daily goals and tasks
- **Analytics Dashboard**: Visual insights into application patterns and success rates

### User Experience
- **Responsive Design**: Optimized Web app.
- **Real-time Updates**: Instant synchronization across all devices
- **Intuitive Interface**: Clean, modern UI built with shadcn/ui components

### Security & Authentication
- **Secure User Authentication**: Registration and login with JWT tokens
- **Protected Routes**: User data is secured and accessible only after authentication
- **Personal Data Management**: Each user's data is completely isolated

## Technologies Used

### Frontend Stack
- **React 18**: Modern React with hooks for component state management
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: High-quality, accessible React components
- **Lucide React**: Beautiful, customizable icons
- **React Router**: Client-side routing for single-page application
- **TanStack Query**: Data fetching, caching, and synchronization
- **Recharts**: Responsive charts for data visualization

### Backend Architecture
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework
- **Sequelize ORM**: Database abstraction layer
- **MySQL**: Robust relational database
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean, predictable API endpoints

## Why These Technologies?

### React + TypeScript
- **Developer Experience**: Excellent tooling, debugging, and IntelliSense
- **Type Safety**: Prevents runtime errors and improves code quality
- **Component Reusability**: Modular architecture for maintainable code
- **Large Ecosystem**: Extensive library support and community

### Tailwind CSS + shadcn/ui
- **Rapid Development**: Utility classes allow for quick styling
- **Consistent Design**: Pre-built components ensure design consistency
- **Accessibility**: shadcn/ui components are accessible by default
- **Customization**: Easy to customize while maintaining best practices

### MySQL + Sequelize
- **Data Integrity**: ACID compliance and robust data relationships
- **Scalability**: Handles growing datasets efficiently
- **ORM Benefits**: Type-safe database queries and migrations
- **JSON Support**: Flexible data storage when needed

## Demo
![Register](https://github.com/user-attachments/assets/76b701b5-9721-44f7-84c6-08d72a0905c8)
![Login](https://github.com/user-attachments/assets/df48be08-2c3c-4926-92d6-48dd49f8cd9e)
![Initial Dashboard 1](https://github.com/user-attachments/assets/ccb72b36-4b80-4108-a2c7-8300d6b1da3e)
![Initial Dashboard 2](https://github.com/user-attachments/assets/3714bff5-868d-4e8b-a3b2-7eb3dc455054)
![Initial Dashboard 3](https://github.com/user-attachments/assets/d4de6382-505a-49d4-adcf-70320aacb214)
![Add Project](https://github.com/user-attachments/assets/87c980e4-4bac-4362-b8e4-46ab88ad1fd3)
![Daily Execution](https://github.com/user-attachments/assets/945588af-5bd1-48a6-997c-523654bbacd1)
![Add job](https://github.com/user-attachments/assets/b78fe462-8537-4ed8-b393-5965e33d58ea)
![Job Track](https://github.com/user-attachments/assets/461a7d07-41d4-4fee-8f9c-1fd34d3271e3)
![Weeky Review](https://github.com/user-attachments/assets/71cd96cb-660b-46d6-be75-5e8c62c8d26b)
![Weeky Review 2](https://github.com/user-attachments/assets/be1c2167-293b-47c6-85a9-a7add77aa9df)
![Final Dashboard](https://github.com/user-attachments/assets/674e6d2c-b477-420a-8dc4-6972edb60d33)
![Final Dashboard 1](https://github.com/user-attachments/assets/2f02233f-a1f4-45ef-a54c-42b9d4531aef)
![Final Dashboard 2](https://github.com/user-attachments/assets/385ac250-d8de-4909-ae03-214266156f21)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectpath
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create MySQL database
   createdb job_tracker_db
   
   # Run migrations
   npm run migrate
   ```

4. **Configure environment variables**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd src
   npm run dev
   ```

## Database Schema

### Core Tables
- **Users**: User authentication and profile information
- **JobApplications**: Job postings and application details
- **WeeklyReviews**: Weekly reflection and progress tracking
- **DailyEntries**: Daily goals and task completion
- **Projects**: Organizational structure for larger goals

### Relationships
- Users have many JobApplications, WeeklyReviews, and DailyEntries
- JobApplications can be linked to Projects for better organization
- WeeklyReviews track progress on specific Projects

## Security Features

- **JWT Authentication**: Secure, stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries via Sequelize
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Design Philosophy

### User-Centric Design
- **Minimal Cognitive Load**: Clean, uncluttered interface
- **Progressive Disclosure**: Show relevant information when needed
- **Consistent Patterns**: Familiar UI patterns throughout the app

### Performance Optimization
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Image Optimization**: Efficient image loading and caching
- **Database Indexing**: Optimized queries for fast data retrieval
- **Caching Strategy**: Smart caching for frequently accessed data

## Future Enhancements

### Planned Features
- **Email Notifications**: Automated reminders and updates
- **Mobile App Development**: Develop a mobile version of the app for improved user experience


## Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:
- Report bugs
- Suggest features
- Submit pull requests
- Follow coding standards

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Muyango Sam Evrald**
Software Developer
