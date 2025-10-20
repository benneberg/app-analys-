import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { formatDate } from '../lib/utils';
import { ProjectDetail } from '../components/ProjectDetail';

export const ProjectsPage = () => {
  const { projects, addProject, updateProject, deleteProject, profileApp } = useData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    urls: '',
  });
  const [isProfiling, setIsProfiling] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      urls: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    
    const urlsArray = formData.urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);

    addProject({
      name: formData.name,
      description: formData.description,
      code: formData.code,
      urls: urlsArray,
    });
    
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!formData.name.trim() || !selectedProject) return;
    
    const urlsArray = formData.urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);

    updateProject(selectedProject.id, {
      name: formData.name,
      description: formData.description,
      code: formData.code,
      urls: urlsArray,
    });
    
    setIsEditOpen(false);
    setSelectedProject(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const handleProfileApp = async (projectId) => {
    setIsProfiling(true);
    await profileApp(projectId);
    setIsProfiling(false);
  };

  const openEditDialog = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      code: project.code || '',
      urls: (project.urls || []).join('\n'),
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
            Projects
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your application audit projects
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to audit with AI experts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome App"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Paste your code here..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urls">URLs (one per line)</Label>
                <Textarea
                  id="urls"
                  value={formData.urls}
                  onChange={(e) => setFormData({ ...formData, urls: e.target.value })}
                  placeholder="https://example.com&#10;https://app.example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-muted p-6 border-brutal-sm">
              <Folder className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground font-medium">
                Create your first project to get started
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Code: {project.code ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span>URLs: {project.urls?.length || 0}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Created: {formatDate(project.createdAt)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => handleProfileApp(project.id)}
                  disabled={isProfiling}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isProfiling ? 'Profiling...' : 'Profile App'}
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDetailDialog(project)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(project)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code</Label>
              <Textarea
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-urls">URLs (one per line)</Label>
              <Textarea
                id="edit-urls"
                value={formData.urls}
                onChange={(e) => setFormData({ ...formData, urls: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedProject(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedProject && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <ProjectDetail project={selectedProject} onClose={() => setIsDetailOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Import missing icon
import { Folder, Zap } from 'lucide-react';
