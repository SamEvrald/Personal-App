
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, CheckSquare, BarChart } from "lucide-react";
import JobTracker from "@/components/JobTracker";
import WeeklyReview from "@/components/WeeklyReview";
import DailyExecution from "@/components/DailyExecution";
import Dashboard from "@/components/Dashboard";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Job Application Tracker
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Stay organized and track your job applications, weekly progress, and daily execution
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-8 h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Job Applications</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Weekly Review</span>
              <span className="sm:hidden">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Daily Execution</span>
              <span className="sm:hidden">Daily</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="jobs">
            <JobTracker />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyReview />
          </TabsContent>

          <TabsContent value="daily">
            <DailyExecution />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
