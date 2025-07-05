import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ExternalLink, Trash2, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jobsApi } from "@/services/api";

interface JobApplication {
  id: string;
  companyName: string;
  positionTitle: string;
  applicationUrl?: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  applicationDate: string;
  location?: string;
  remoteOption: boolean;
}

const PLATFORMS = [
  "Upwork",
  "Toptal", 
  "TestGorilla",
  "LinkedIn",
  "AngelList",
  "RemoteOK",
  "InstructionalDesign.org"
];

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-800",
  screening: "bg-yellow-100 text-yellow-800",
  interview: "bg-orange-100 text-orange-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800"
};

const JobTracker = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [jobLink, setJobLink] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getAll();
      if (response.success) {
        setJobs(response.data.applications);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch job applications",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addJob = async () => {
    if (!jobLink || !selectedPlatform || !companyName || !positionTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const jobData = {
        companyName,
        positionTitle,
        applicationUrl: jobLink,
        applicationDate: new Date().toISOString().split('T')[0],
        status: "applied",
        location: selectedPlatform,
        remoteOption: true,
        notes: `Applied via ${selectedPlatform}`
      };

      const response = await jobsApi.create(jobData);
      
      if (response.success) {
        setJobs([response.data, ...jobs]);
        setJobLink("");
        setSelectedPlatform("");
        setCompanyName("");
        setPositionTitle("");
        
        toast({
          title: "Job Added",
          description: "Job application has been tracked successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create job application",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Create job error:', error);
      toast({
        title: "Error",
        description: "Failed to create job application",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: JobApplication["status"]) => {
    try {
      // Find the job application to get its current full data
      const jobToUpdate = jobs.find(job => job.id === jobId);

      if (!jobToUpdate) {
        toast({
          title: "Error",
          description: "Job application not found for update.",
          variant: "destructive"
        });
        return;
      }

      // Create a new object with all existing job data, and then override the status
      const updatedJobData = {
        companyName: jobToUpdate.companyName,
        positionTitle: jobToUpdate.positionTitle,
        applicationDate: jobToUpdate.applicationDate,
        status: newStatus, // Only this field is changing
        applicationUrl: jobToUpdate.applicationUrl || null, // Ensure optional fields are handled
        salaryRange: (jobToUpdate as any).salaryRange || null, // Cast to any to access salaryRange if not in interface
        location: jobToUpdate.location || null,
        remoteOption: jobToUpdate.remoteOption,
        notes: (jobToUpdate as any).notes || null, // Cast to any to access notes if not in interface
        jobDescription: (jobToUpdate as any).jobDescription || null // Cast to any to access jobDescription if not in interface
      };

      const response = await jobsApi.update(jobId, updatedJobData); // Send the full data
      
      if (response.success) {
        // Update the state with the response data (which should be the updated job)
        setJobs(jobs.map(job => 
          job.id === jobId ? response.data : job
        ));
        
        toast({
          title: "Status Updated",
          description: `Job status changed to ${newStatus}`
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update job status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Update job error:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await jobsApi.delete(jobId);
      
      if (response.success) {
        setJobs(jobs.filter(job => job.id !== jobId));
        toast({
          title: "Job Removed",
          description: "Job application has been removed from tracking"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete job application",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Delete job error:', error);
      toast({
        title: "Error",
        description: "Failed to delete job application",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Job Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Job Application
          </CardTitle>
          <CardDescription>
            Track a new job application by providing the job details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionTitle">Position Title *</Label>
              <Input
                id="positionTitle"
                placeholder="Job position"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobLink">Job Link *</Label>
              <Input
                id="jobLink"
                placeholder="Job posting URL"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addJob} className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Job
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Job Applications ({jobs.length})</CardTitle>
          <CardDescription>
            Manage your job applications and update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No job applications tracked yet</p>
              <p className="text-sm">Add your first job application above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Job Link</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.companyName}
                      </TableCell>
                      <TableCell>{job.positionTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.location}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={job.status}
                          onValueChange={(value) => updateJobStatus(job.id, value as JobApplication["status"])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="screening">Screening</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(job.applicationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {job.applicationUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(job.applicationUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteJob(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobTracker;
