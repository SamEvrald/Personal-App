import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Save, Plus, X, Calendar, Upload, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dailyApi, projectsApi } from "@/services/api";

// Define interfaces for better type safety and clarity
interface Subproject {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  deadline?: Date;
  subprojects: Subproject[];
}

interface DailyExecutionEntry {
  id: string;
  date: string; // ISO string from backend
  dailyFocus: boolean;
  whatShippedToday: string;
  proofLink?: string;
  proofFiles?: { fileName: string; fileUrl: string }[]; // Simplified for display after fetch
  whatSlowedDown: string;
  whatToFixTomorrow: string;
  projectId: string;
  subprojectId?: string;
  hoursSpent: number;
  createdAt: string; // ISO string
}

const DailyExecution = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<DailyExecutionEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    dailyFocus: false,
    whatShippedToday: "",
    proofLink: "",
    proofFiles: [] as File[],
    whatSlowedDown: "",
    whatToFixTomorrow: "",
    projectId: "",
    subprojectId: "",
    hoursSpent: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    deadline: "",
    subprojects: [] as Subproject[]
  });
  const [newSubprojectName, setNewSubprojectName] = useState("");
  const [proofMethod, setProofMethod] = useState<"link" | "upload">("link");
  const { toast } = useToast();
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await projectsApi.getAll();
        if (response.success) {
          const fetchedProjects: Project[] = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            deadline: p.deadline ? new Date(p.deadline) : undefined,
            subprojects: p.subprojects ? p.subprojects.map((sp: any) => ({ id: sp.id, name: sp.name })) : []
          }));
          setProjects(fetchedProjects);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch projects",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to fetch projects due to network error",
          variant: "destructive"
        });
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch daily entries on component mount or after saving an entry
  const fetchDailyEntries = useCallback(async () => {
    try {
      setLoadingEntries(true);
      const response = await dailyApi.getAll();
      if (response.success) {
        const fetchedEntries: DailyExecutionEntry[] = response.data.entries.map((entry: any) => ({
          id: entry.id,
          date: entry.entryDate,
          dailyFocus: entry.dailyFocus,
          whatShippedToday: entry.whatShippedToday,
          proofLink: entry.proofLink,
          proofFiles: entry.proofFiles ? entry.proofFiles.map((pf: any) => ({ fileName: pf.fileName, fileUrl: pf.fileUrl })) : [],
          whatSlowedDown: entry.whatSlowedDown,
          whatToFixTomorrow: entry.whatToFixTomorrow,
          projectId: entry.projectId,
          subprojectId: entry.subprojectId,
          hoursSpent: entry.hoursSpent,
          createdAt: entry.createdAt
        }));
        setEntries(fetchedEntries);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch daily entries",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching daily entries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch daily entries due to network error",
        variant: "destructive"
      });
    } finally {
      setLoadingEntries(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDailyEntries();
  }, [fetchDailyEntries]);


  const addProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    try {
      const projectDataToSave = {
        name: newProject.name.trim(),
        deadline: newProject.deadline ? new Date(newProject.deadline).toISOString().split('T')[0] : null,
        subprojects: newProject.subprojects.map(sp => sp.name)
      };
      const response = await projectsApi.create(projectDataToSave);

      if (response.success) {
        const createdProject: Project = {
          id: response.data.id,
          name: response.data.name,
          deadline: response.data.deadline ? new Date(response.data.deadline) : undefined,
          subprojects: response.data.subprojects ? response.data.subprojects.map((sp: any) => ({ id: sp.id, name: sp.name })) : []
        };
        setProjects([...projects, createdProject]);
        setNewProject({ name: "", deadline: "", subprojects: [] });
        setShowNewProject(false);
        toast({
          title: "Project added",
          description: `${createdProject.name} has been added to your projects`
        });
      } else {
        toast({
          title: "Error adding project",
          description: response.message || "Failed to add project",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to add project due to network error",
        variant: "destructive"
      });
    }
  };

  const addSubproject = () => {
    if (!newSubprojectName.trim()) return;
    
    setNewProject({
      ...newProject,
      subprojects: [...newProject.subprojects, { id: Date.now().toString(), name: newSubprojectName.trim() }]
    });
    setNewSubprojectName("");
  };

  const removeSubproject = (id: string) => {
    setNewProject({
      ...newProject,
      subprojects: newProject.subprojects.filter((sub) => sub.id !== id)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only images and videos under 10MB are allowed",
        variant: "destructive"
      });
    }

    const totalFiles = currentEntry.proofFiles.length + validFiles.length;
    if (totalFiles > 5) {
      toast({
        title: "Too many files",
        description: "Maximum 5 files allowed",
        variant: "destructive"
      });
      return;
    }

    setCurrentEntry({
      ...currentEntry,
      proofFiles: [...currentEntry.proofFiles, ...validFiles]
    });
  };

  const removeFile = (index: number) => {
    setCurrentEntry({
      ...currentEntry,
      proofFiles: currentEntry.proofFiles.filter((_, i) => i !== index)
    });
  };

  const saveEntry = async () => {
    if (!currentEntry.whatShippedToday || !currentEntry.projectId) {
      toast({
        title: "Incomplete Entry",
        description: "Please fill the 'What you shipped today' field and select a project",
        variant: "destructive"
      });
      return;
    }

    if (currentEntry.hoursSpent <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter a valid number of hours spent",
        variant: "destructive"
      });
      return;
    }

    const hasProofLink = currentEntry.proofLink.trim().length > 0;
    const hasProofFiles = currentEntry.proofFiles.length > 0;
    
    if (!hasProofLink && !hasProofFiles) {
      toast({
        title: "Proof Required",
        description: "Please provide either a link or upload at least one file as proof",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('dailyFocus', currentEntry.dailyFocus.toString());
      formData.append('whatShippedToday', currentEntry.whatShippedToday);
      formData.append('whatSlowedDown', currentEntry.whatSlowedDown);
      formData.append('whatToFixTomorrow', currentEntry.whatToFixTomorrow);
      formData.append('projectId', currentEntry.projectId);
      formData.append('hoursSpent', currentEntry.hoursSpent.toString());
      formData.append('entryDate', new Date().toISOString().split('T')[0]); // Send as 'YYYY-MM-DD'

      if (currentEntry.subprojectId) {
        formData.append('subprojectId', currentEntry.subprojectId);
      }
      if (currentEntry.proofLink) {
        formData.append('proofLink', currentEntry.proofLink);
      }
      currentEntry.proofFiles.forEach((file) => {
        formData.append('proofFiles', file);
      });

      const response = await dailyApi.create(formData);

      if (response.success) {
        await fetchDailyEntries(); 

        setCurrentEntry({ // Reset form
          dailyFocus: false,
          whatShippedToday: "",
          proofLink: "",
          proofFiles: [],
          whatSlowedDown: "",
          whatToFixTomorrow: "",
          projectId: "",
          subprojectId: "",
          hoursSpent: 0
        });
        toast({
          title: "Entry Saved",
          description: "Your daily execution entry has been saved successfully"
        });
      } else {
        toast({
          title: "Error Saving Entry",
          description: response.message || "Failed to save daily entry",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving daily entry:", error);
      toast({
        title: "Error",
        description: "Failed to save daily entry due to network error",
        variant: "destructive"
      });
    }
  };

  const getAvailableSubprojects = () => {
    const selectedProject = projects.find(p => p.id === currentEntry.projectId);
    return selectedProject?.subprojects || [];
  };

  const getProjectNameById = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "Unknown Project";
  };

  const getSubprojectNameById = (projectId: string, subprojectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const subproject = project.subprojects.find(sp => sp.id === subprojectId);
      return subproject ? subproject.name : "Unknown Subproject";
    }
    return "Unknown Subproject";
  };

  if (loadingProjects || loadingEntries) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading projects and daily entries...</p>
      </div>
    );
  }

 return (
  <div className="space-y-6">
    {/* Project Management */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Management</span>
          <Button onClick={() => setShowNewProject(!showNewProject)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </CardTitle>
      </CardHeader>
      {showNewProject && (
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDeadline">Deadline (optional)</Label>
                <Input
                  id="projectDeadline"
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subprojects (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add subproject"
                  value={newSubprojectName}
                  onChange={(e) => setNewSubprojectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubproject()}
                />
                <Button onClick={addSubproject} type="button" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newProject.subprojects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProject.subprojects.map((sub) => (
                    <Badge key={sub.id} variant="secondary" className="flex items-center gap-1">
                      {sub.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSubproject(sub.id)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={addProject}>Add Project</Button>
              <Button variant="outline" onClick={() => setShowNewProject(false)}>Cancel</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>

    {/* New Entry Form */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Daily Execution
        </CardTitle>
        <CardDescription>
          Track your daily progress, what you accomplished, and what needs improvement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dailyFocus"
              checked={currentEntry.dailyFocus}
              onCheckedChange={(checked) => 
                setCurrentEntry({...currentEntry, dailyFocus: checked as boolean})
              }
            />
            <Label htmlFor="dailyFocus" className="text-lg font-medium">
              ✅ Daily Focus - Did I maintain focus today?
            </Label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project worked on</Label>
              <Select 
                value={currentEntry.projectId}
                onValueChange={(value) => setCurrentEntry({...currentEntry, projectId: value, subprojectId: ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                      {project.deadline && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Due: {project.deadline.toLocaleDateString()})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursSpent">Hours spent</Label>
              <Input
                id="hoursSpent"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={currentEntry.hoursSpent || ""}
                onChange={(e) => setCurrentEntry({...currentEntry, hoursSpent: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          {getAvailableSubprojects().length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subproject">Subproject (optional)</Label>
              <Select 
                value={currentEntry.subprojectId}
                onValueChange={(value) => setCurrentEntry({...currentEntry, subprojectId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subproject (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSubprojects().map((subproject) => (
                    <SelectItem key={subproject.id} value={subproject.id}>
                      {subproject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="whatShippedToday">What you shipped today</Label>
            <Textarea
              id="whatShippedToday"
              placeholder="What did you complete or deliver today?"
              value={currentEntry.whatShippedToday}
              onChange={(e) => setCurrentEntry({...currentEntry, whatShippedToday: e.target.value})}
              rows={3}
            />
          </div>

          {/* Proof Section */}
          <div className="space-y-4">
            <Label>Proof (required - choose one method)</Label>

            <div className="flex gap-4">
              <Button
                type="button"
                variant={proofMethod === "link" ? "default" : "outline"}
                onClick={() => setProofMethod("link")}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Link
              </Button>
              <Button
                type="button"
                variant={proofMethod === "upload" ? "default" : "outline"}
                onClick={() => setProofMethod("upload")}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
            </div>

            {proofMethod === "link" ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter proof link (screenshots, demo, etc.)"
                  value={currentEntry.proofLink}
                  onChange={(e) => setCurrentEntry({...currentEntry, proofLink: e.target.value})}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <Label htmlFor="fileUpload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Click to upload images or videos (max 5 files, 10MB each)
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF, MP4, MOV, AVI
                  </p>
                </div>

                {currentEntry.proofFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files ({currentEntry.proofFiles.length}/5)</Label>
                    <div className="space-y-2">
                      {currentEntry.proofFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>  
            )}       {/* ✅ FIX 2 */}

          </div>

          <div className="space-y-2">
            <Label htmlFor="whatSlowedDown">What slowed you down</Label>
            <Textarea
              id="whatSlowedDown"
              placeholder="What obstacles, distractions, or challenges did you face?"
              value={currentEntry.whatSlowedDown}
              onChange={(e) => setCurrentEntry({...currentEntry, whatSlowedDown: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatToFixTomorrow">What you'll fix tomorrow</Label>
            <Textarea
              id="whatToFixTomorrow"
              placeholder="What will you do differently or focus on tomorrow?"
              value={currentEntry.whatToFixTomorrow}
              onChange={(e) => setCurrentEntry({...currentEntry, whatToFixTomorrow: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveEntry}>
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
};

export default DailyExecution;
