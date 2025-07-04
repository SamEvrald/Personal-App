
-- Logbook Application Database Schema
-- Created: 2025-07-03
-- Modified for MySQL compatibility

-- Users table (for authentication and user management)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table (dynamic project creation)
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    total_hours_logged DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_project (user_id, name)
);

-- Subprojects table (for project subdivisions)
CREATE TABLE subprojects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_subproject (project_id, name)
);

-- Daily execution entries table
CREATE TABLE daily_execution_entries (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    project_id CHAR(36) NOT NULL,
    subproject_id CHAR(36),
    entry_date DATE NOT NULL,
    daily_focus BOOLEAN DEFAULT FALSE,
    what_shipped_today LONGTEXT NOT NULL,
    what_slowed_down LONGTEXT,
    what_to_fix_tomorrow LONGTEXT,
    hours_spent DECIMAL(4,2) NOT NULL CHECK (hours_spent > 0),
    proof_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (subproject_id) REFERENCES subprojects(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (user_id, entry_date)
);

-- Proof files table (for uploaded media files)
CREATE TABLE proof_files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    daily_execution_entry_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (daily_execution_entry_id) REFERENCES daily_execution_entries(id) ON DELETE CASCADE
);

-- Weekly review entries table
CREATE TABLE weekly_review_entries (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    project_id CHAR(36) NOT NULL,
    subproject_id CHAR(36),
    week_start_date DATE NOT NULL,
    what_shipped LONGTEXT NOT NULL,
    what_failed_to_deliver LONGTEXT,
    what_distracted LONGTEXT,
    what_learned LONGTEXT NOT NULL,
    hours_spent DECIMAL(5,2) NOT NULL CHECK (hours_spent > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (subproject_id) REFERENCES subprojects(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_week_project (user_id, week_start_date, project_id)
);

-- Job applications table (for job tracking functionality)
CREATE TABLE job_applications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    job_description LONGTEXT,
    application_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')),
    application_url TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    remote_option BOOLEAN DEFAULT FALSE,
    notes LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job application activities table (for tracking follow-ups, interviews, etc.)
CREATE TABLE job_application_activities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_application_id CHAR(36) NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('application', 'follow_up', 'phone_screen', 'interview', 'offer', 'rejection', 'withdrawal')),
    activity_date DATE NOT NULL,
    description LONGTEXT,
    contact_person VARCHAR(255),
    notes LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_subprojects_project_id ON subprojects(project_id);

CREATE INDEX idx_daily_execution_user_id ON daily_execution_entries(user_id);
CREATE INDEX idx_daily_execution_project_id ON daily_execution_entries(project_id);
CREATE INDEX idx_daily_execution_date ON daily_execution_entries(entry_date);
CREATE INDEX idx_daily_execution_user_date ON daily_execution_entries(user_id, entry_date);

CREATE INDEX idx_proof_files_entry_id ON proof_files(daily_execution_entry_id);

CREATE INDEX idx_weekly_review_user_id ON weekly_review_entries(user_id);
CREATE INDEX idx_weekly_review_project_id ON weekly_review_entries(project_id);
CREATE INDEX idx_weekly_review_week ON weekly_review_entries(week_start_date);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_date ON job_applications(application_date);

CREATE INDEX idx_job_activities_application_id ON job_application_activities(job_application_id);
CREATE INDEX idx_job_activities_date ON job_application_activities(activity_date);

-- MySQL Trigger to update project total hours when daily entries are added/updated/deleted
DELIMITER $$

CREATE TRIGGER update_project_hours_insert
    AFTER INSERT ON daily_execution_entries
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET total_hours_logged = (
        SELECT COALESCE(SUM(hours_spent), 0)
        FROM daily_execution_entries 
        WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
END$$

CREATE TRIGGER update_project_hours_update
    AFTER UPDATE ON daily_execution_entries
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET total_hours_logged = (
        SELECT COALESCE(SUM(hours_spent), 0)
        FROM daily_execution_entries 
        WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
    
    -- Update old project if project_id changed
    IF OLD.project_id != NEW.project_id THEN
        UPDATE projects 
        SET total_hours_logged = (
            SELECT COALESCE(SUM(hours_spent), 0)
            FROM daily_execution_entries 
            WHERE project_id = OLD.project_id
        )
        WHERE id = OLD.project_id;
    END IF;
END$$

CREATE TRIGGER update_project_hours_delete
    AFTER DELETE ON daily_execution_entries
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET total_hours_logged = (
        SELECT COALESCE(SUM(hours_spent), 0)
        FROM daily_execution_entries 
        WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
END$$

DELIMITER ;

-- Create views for common queries
-- View for project summaries with hours and entry counts
CREATE VIEW project_summaries AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.description,
    p.deadline,
    p.status,
    p.total_hours_logged,
    COUNT(DISTINCT de.id) as total_entries,
    COUNT(DISTINCT wr.id) as total_reviews,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN daily_execution_entries de ON p.id = de.project_id
LEFT JOIN weekly_review_entries wr ON p.id = wr.project_id
GROUP BY p.id, p.user_id, p.name, p.description, p.deadline, p.status, p.total_hours_logged, p.created_at, p.updated_at;

-- View for recent activity across all entry types
CREATE VIEW recent_activity AS
SELECT 
    'daily_execution' as activity_type,
    de.id,
    de.user_id,
    p.name as project_name,
    sp.name as subproject_name,
    de.entry_date as activity_date,
    de.what_shipped_today as activity_description,
    de.hours_spent,
    de.created_at
FROM daily_execution_entries de
JOIN projects p ON de.project_id = p.id
LEFT JOIN subprojects sp ON de.subproject_id = sp.id

UNION ALL

SELECT 
    'weekly_review' as activity_type,
    wr.id,
    wr.user_id,
    p.name as project_name,
    sp.name as subproject_name,
    wr.week_start_date as activity_date,
    wr.what_shipped as activity_description,
    wr.hours_spent,
    wr.created_at
FROM weekly_review_entries wr
JOIN projects p ON wr.project_id = p.id
LEFT JOIN subprojects sp ON wr.subproject_id = sp.id

ORDER BY created_at DESC;

-- Insert sample data for testing (optional - can be removed in production)
-- This helps with initial development and testing
INSERT INTO users (id, email, full_name) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User');

INSERT INTO projects (id, user_id, name, deadline) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Logbook App', '2025-07-11'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Resume App', '2025-07-25'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Instructional Design Showcase', '2025-07-24'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Portfolio Website', '2025-07-25');

INSERT INTO subprojects (project_id, name) VALUES 
('00000000-0000-0000-0000-000000000003', 'Designing Effective Feedback and Grading Strategies in Online Learning'),
('00000000-0000-0000-0000-000000000003', 'Mastering Instructional Design for Digital Transformation');
