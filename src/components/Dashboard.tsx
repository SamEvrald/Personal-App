import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Calendar, Briefcase, Target, Activity, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jobsApi, projectsApi, dailyApi } from "@/services/api"; // Import your API functions

// Define interfaces for data fetched from backend
interface JobApplication {
  id: string;
  status: string;
  platform: string;
  createdAt: string; // ISO string from backend
}

interface Project {
  id: string;
  name: string;
  deadline?: string; // ISO string from backend
  totalHoursLogged: number; // From backend
  subprojects: { id: string; name: string }[]; // Assuming subprojects are returned with ID and name
}

interface DailyEntry {
  id: string;
  entryDate: string;
  hoursSpent: number;
  projectId: string;
}

const COLORS = {
  applied: "#3b82f6",
  screening: "#f59e0b",
  interview: "#f59e0b", // Group screening and interview for color
  offer: "#10b981",
  rejected: "#ef4444",
  withdrawn: "#a8a29e",
};

const PROJECT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#a8a29e", "#34d399", "#60a5fa"]; // More colors for projects

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  

  // Function to fetch all data
   const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Job Applications
      const jobsResponse = await jobsApi.getAll();
      if (jobsResponse.success) {
        console.log("Raw jobsResponse.data.applications:", jobsResponse.data.applications); // DEBUG LOG 1

        const fetchedJobApplications: JobApplication[] = (jobsResponse.data.applications || []).map((job: any) => {
          // Ensure createdAt is a valid date string for parsing.
          // If the backend returns 'YYYY-MM-DD HH:MM:SS' (MySQL DATETIME),
          // it's better to replace space with 'T' for ISO format.
          const createdAtString = job.createdAt ? job.createdAt.replace(' ', 'T') : new Date().toISOString();
          const createdAtDate = new Date(createdAtString);
          
          // Fallback to current date if parsing results in Invalid Date
          const validCreatedAt = createdAtDate.toString() !== 'Invalid Date' ? createdAtString : new Date().toISOString(); 

          return {
            id: job.id,
            status: job.status,
            platform: job.location || 'Unknown', // Map location to platform, provide fallback
            createdAt: validCreatedAt
          };
        });
        setJobApplications(fetchedJobApplications);
        console.log("Mapped Job Applications (after setJobApplications):", fetchedJobApplications); // DEBUG LOG 2
      } else {
        toast({
          title: "Error",
          description: jobsResponse.message || "Failed to fetch job applications",
          variant: "destructive"
        });
      }

      // Fetch Projects
      const projectsResponse = await projectsApi.getAll();
      if (projectsResponse.success) {
        const fetchedProjects: Project[] = (projectsResponse.data || []).map((p: any) => ({
  id: p.id,
  name: p.name,
  deadline: p.deadline,
  totalHoursLogged: parseFloat(p.totalHoursLogged) || 0, // <-- THIS IS THE KEY CHANGE
  subprojects: p.subprojects ? p.subprojects.map((sp: any) => ({ id: sp.id, name: sp.name })) : []
}));
setProjects(fetchedProjects);
      } else {
        toast({
          title: "Error",
          description: projectsResponse.message || "Failed to fetch projects",
          variant: "destructive"
        });
      }

      // Fetch Daily Entries (for total hours calculation on frontend if not provided by project API)
      // Or, ideally, your projectsApi.getAll would already return totalHoursLogged for each project
      const dailyEntriesResponse = await dailyApi.getAll({ limit: 9999 }); // Fetch all for calculations
      if (dailyEntriesResponse.success) {
        setDailyEntries(dailyEntriesResponse.data.entries || []);
      } else {
        toast({
          title: "Error",
          description: dailyEntriesResponse.message || "Failed to fetch daily entries",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data due0 to network error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for upcoming deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      projects.forEach(project => {
        const deadlineDate = project.deadline ? new Date(project.deadline) : null;
        if (deadlineDate && deadlineDate <= threeDaysFromNow && deadlineDate >= now) {
          const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          toast({
            title: "Deadline Reminder",
            description: `${project.name} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`,
            variant: "destructive"
          });
        }
      });
    };

    // Check deadlines on component mount and whenever projects data changes
    checkDeadlines();
    
    // Set up interval to check every hour
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [projects, toast]); // Add projects to dependency array

  const analytics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filterItemsByTimeframe = <T extends { createdAt?: string | Date; entryDate?: string | Date }>(
      items: T[], 
      timeframe: string, 
      dateKey: 'createdAt' | 'entryDate'
    ) => {
      let startDate: Date;
      switch (timeframe) {
        case "daily":
          startDate = startOfDay;
          break;
        case "weekly":
          startDate = startOfWeek;
          break;
        case "monthly":
          startDate = startOfMonth;
          break;
        default:
          return items;
      }
      return items.filter(item => {
        const itemDate = new Date(item[dateKey] as string);
        return itemDate >= startDate;
      });
    };

    const filteredJobs = filterItemsByTimeframe(jobApplications, timeframe, 'createdAt');

    // Status distribution
    const statusCounts = filteredJobs.reduce((acc, job) => {
      // Group 'screening' and 'interview' together for display if desired, or keep separate
      const statusKey = job.status === 'screening' ? 'interview' : job.status;
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: COLORS[status as keyof typeof COLORS] || '#cccccc' // Fallback color
    }));

    // Platform distribution
    const platformCounts = filteredJobs.reduce((acc, job) => {
      acc[job.platform] = (acc[job.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformData = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count
    }));

    // Daily trend for the past 7 days (based on job applications)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayJobs = jobApplications.filter(job => {
        const jobCreatedAt = new Date(job.createdAt);
        return jobCreatedAt >= dayStart && jobCreatedAt < dayEnd;
      });

      dailyTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        applications: dayJobs.length
      });
    }

    // Project data for charts (using totalHoursLogged from fetched projects)
    const projectData = projects.map((project, index) => ({
      name: project.name,
      hours: project.totalHoursLogged, // Use totalHoursLogged from backend
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      fill: PROJECT_COLORS[index % PROJECT_COLORS.length]
    }));

  const totalProjectHours = projects.reduce((sum, project) => sum + (project.totalHoursLogged || 0), 0);

    return {
      totalJobs: filteredJobs.length,
      statusData,
      platformData,
      dailyTrend,
      projectData,
      totalProjectHours,
      conversionRate: filteredJobs.length > 0 ? 
        Math.round((filteredJobs.filter(job => job.status === 'offer').length / filteredJobs.length) * 100) : 0,
      interviewRate: filteredJobs.length > 0 ? 
        Math.round((filteredJobs.filter(job => job.status === 'interview' || job.status === 'screening').length / filteredJobs.length) * 100) : 0
    };
  }, [timeframe, jobApplications, projects]);

  const chartConfig = {
    applied: {
      label: "Applied",
      color: COLORS.applied,
    },
    interviewing: {
      label: "Interviewing", 
      color: COLORS.interview,
    },
    offer: {
      label: "Offer",
      color: COLORS.offer,
    },
    // Add other statuses if they appear in your data and you want specific colors
    screening: {
      label: "Screening",
      color: COLORS.screening,
    },
    rejected: {
      label: "Rejected",
      color: COLORS.rejected,
    },
    withdrawn: {
      label: "Withdrawn",
      color: COLORS.withdrawn,
    }
  };

  const getDaysUntilDeadline = (deadline: string | undefined) => {
    if (!deadline) return Infinity; // Handle cases with no deadline
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const sendTrackingReminder = () => {
    toast({
      title: "Tracking Reminder",
      description: "Don't forget to log your daily execution and update your weekly review!",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Track your job application progress, project metrics, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendTrackingReminder} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Remind Me to Track
          </Button>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "daily" | "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {timeframe} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.interviewRate}%</div>
            <p className="text-xs text-muted-foreground">
              Applications to interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Applications to offers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProjectHours.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeframe === "daily" ? analytics.totalJobs : 
               timeframe === "weekly" ? Math.round(analytics.totalJobs / 7) : 
               Math.round(analytics.totalJobs / 30)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg per {timeframe === "monthly" ? "day" : timeframe === "weekly" ? "day" : "today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Deadlines Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Deadlines
          </CardTitle>
          <CardDescription>Upcoming project deadlines and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {projects.map((project, index) => {
              const daysLeft = getDaysUntilDeadline(project.deadline);
              const isUrgent = daysLeft <= 3 && daysLeft >= 0; // Only urgent if not overdue
              
              return (
                <div key={project.id} className={`flex items-center justify-between p-3 rounded-lg border ${isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-gray-600">
                      {project.totalHoursLogged} hours logged
                      {project.subprojects.length > 0 && (
                        <span className="text-xs text-gray-500 block">
                          Includes: {project.subprojects.map(sp => sp.name).join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isUrgent ? "destructive" : "outline"}>
                      {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Project Hours Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Hours Distribution</CardTitle>
            <CardDescription>Time spent on each project</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.projectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="hours"
                    nameKey="name"
                  >
                    {analytics.projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Distribution of your job applications by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platforms Used</CardTitle>
            <CardDescription>Job applications by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" fontSize={12} />
                  <YAxis />
                  <Bar dataKey="count" fill="#3b82f6" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Project Hours Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Project Hours Breakdown</CardTitle>
            <CardDescription>Hours logged per project</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis />
                  <Bar dataKey="hours" fill="#8b5cf6" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Application Trend</CardTitle>
          <CardDescription>Your daily application activity over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
          <CardDescription>Quick summary of your applications and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Application Status</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.statusData.map((item) => (
                  <Badge key={item.status} variant="outline" className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.status}: {item.count}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Project Progress</h4>
              <div className="flex flex-wrap gap-2">
                {/* Use analytics.projectData for display here */}
                {analytics.projectData.map((project, index) => (
                  <Badge key={project.name} variant="outline" className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: project.fill }} // Use project.fill from analytics.projectData
                    />
                    {project.name}: {project.hours}h
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
