
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { weeklyApi, projectsApi } from "@/services/api";

interface Project {
  id: string;
  name: string;
  subprojects?: { id: string; name: string; }[];
}

interface WeeklyReviewEntry {
  id: string;
  weekStartDate: string;
  whatShipped: string;
  whatFailedToDeliver: string;
  whatDistracted: string;
  whatLearned: string;
  project: { name: string };
  subproject?: { name: string };
  hoursSpent: number;
  createdAt: string;
}

const WeeklyReview = () => {
  const [reviews, setReviews] = useState<WeeklyReviewEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentReview, setCurrentReview] = useState({
    whatShipped: "",
    whatFailedToDeliver: "",
    whatDistracted: "",
    whatLearned: "",
    projectId: "",
    subprojectId: "",
    hoursSpent: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsResponse, projectsResponse] = await Promise.all([
        weeklyApi.getAll(),
        projectsApi.getAll()
      ]);

      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data.reviews);
      }

      if (projectsResponse.success) {
        setProjects(projectsResponse.data.projects);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async () => {
    if (!currentReview.whatShipped && !currentReview.whatLearned) {
      toast({
        title: "Incomplete Review",
        description: "Please fill at least the 'What shipped' or 'What learned' fields",
        variant: "destructive"
      });
      return;
    }

    if (!currentReview.projectId) {
      toast({
        title: "Missing Project",
        description: "Please select a project you worked on this week",
        variant: "destructive"
      });
      return;
    }

    if (currentReview.hoursSpent <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter a valid number of hours spent",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        projectId: currentReview.projectId,
        subprojectId: currentReview.subprojectId || null,
        weekStartDate: getStartOfWeek(new Date()).toISOString().split('T')[0],
        whatShipped: currentReview.whatShipped,
        whatFailedToDeliver: currentReview.whatFailedToDeliver,
        whatDistracted: currentReview.whatDistracted,
        whatLearned: currentReview.whatLearned,
        hoursSpent: currentReview.hoursSpent
      };

      const response = await weeklyApi.create(reviewData);

      if (response.success) {
        setReviews([response.data, ...reviews]);
        setCurrentReview({
          whatShipped: "",
          whatFailedToDeliver: "",
          whatDistracted: "",
          whatLearned: "",
          projectId: "",
          subprojectId: "",
          hoursSpent: 0
        });
        setIsEditing(false);

        toast({
          title: "Review Saved",
          description: "Your weekly review has been saved successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to save weekly review",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Save review error:', error);
      toast({
        title: "Error",
        description: "Failed to save weekly review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const formatWeekRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === currentReview.projectId);
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
      {/* New Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Review
          </CardTitle>
          <CardDescription>
            Reflect on your week and track your progress, challenges, and learnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="text-center py-8">
              <Button onClick={() => setIsEditing(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Start New Weekly Review
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Main project worked on</Label>
                  <Select 
                    value={currentReview.projectId} 
                    onValueChange={(value) => setCurrentReview({...currentReview, projectId: value, subprojectId: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursSpent">Total hours spent this week</Label>
                  <Input
                    id="hoursSpent"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={currentReview.hoursSpent || ""}
                    onChange={(e) => setCurrentReview({...currentReview, hoursSpent: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {getSelectedProject()?.subprojects && getSelectedProject()!.subprojects!.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subproject">Subproject (optional)</Label>
                  <Select 
                    value={currentReview.subprojectId} 
                    onValueChange={(value) => setCurrentReview({...currentReview, subprojectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subproject (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedProject()!.subprojects!.map((subproject) => (
                        <SelectItem key={subproject.id} value={subproject.id}>
                          {subproject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="whatShipped">What did I ship this week?</Label>
                <Textarea
                  id="whatShipped"
                  placeholder="List the deliverables, features, or accomplishments you completed this week..."
                  value={currentReview.whatShipped}
                  onChange={(e) => setCurrentReview({...currentReview, whatShipped: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatFailedToDeliver">What did I fail to deliver?</Label>
                <Textarea
                  id="whatFailedToDeliver"
                  placeholder="What commitments or goals did you not achieve this week?"
                  value={currentReview.whatFailedToDeliver}
                  onChange={(e) => setCurrentReview({...currentReview, whatFailedToDeliver: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatDistracted">What distracted me?</Label>
                <Textarea
                  id="whatDistracted"
                  placeholder="What pulled your attention away from your main goals?"
                  value={currentReview.whatDistracted}
                  onChange={(e) => setCurrentReview({...currentReview, whatDistracted: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatLearned">What did I learn?</Label>
                <Textarea
                  id="whatLearned"
                  placeholder="What insights, skills, or knowledge did you gain this week?"
                  value={currentReview.whatLearned}
                  onChange={(e) => setCurrentReview({...currentReview, whatLearned: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveReview} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Review
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Reviews ({reviews.length})</CardTitle>
            <CardDescription>
              Your weekly review history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Week of {formatWeekRange(review.weekStartDate)}
                      </Badge>
                      <Badge variant="secondary">
                        {review.project.name} - {review.hoursSpent}h
                      </Badge>
                      {review.subproject && (
                        <Badge variant="outline" className="text-xs">
                          {review.subproject.name}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✅ What I Shipped</h4>
                      <p className="text-sm bg-green-50 p-3 rounded">
                        {review.whatShipped || "No items listed"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">❌ What I Failed to Deliver</h4>
                      <p className="text-sm bg-red-50 p-3 rounded">
                        {review.whatFailedToDeliver || "No items listed"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">⚠️ What Distracted Me</h4>
                      <p className="text-sm bg-yellow-50 p-3 rounded">
                        {review.whatDistracted || "No distractions noted"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">🧠 What I Learned</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded">
                        {review.whatLearned || "No learnings noted"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReview;
