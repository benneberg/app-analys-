import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Briefcase } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { formatDate } from '../lib/utils';

export const ExpertsPage = () => {
  const { experts, addExpert, updateExpert, deleteExpert } = useData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    domain_description: '',
    key_objectives: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      domain_description: '',
      key_objectives: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.role.trim()) return;
    
    addExpert(formData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!formData.name.trim() || !formData.role.trim() || !selectedExpert) return;
    
    updateExpert(selectedExpert.id, formData);
    setIsEditOpen(false);
    setSelectedExpert(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expert?')) {
      deleteExpert(id);
    }
  };

  const openEditDialog = (expert) => {
    setSelectedExpert(expert);
    setFormData({
      name: expert.name,
      role: expert.role,
      domain_description: expert.domain_description || '',
      key_objectives: expert.key_objectives || '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
            AI Experts
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Create and manage your AI domain experts
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              New Expert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Expert</DialogTitle>
              <DialogDescription>
                Define a new AI expert with specialized knowledge
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expert Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sales Expert"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Senior Sales Strategist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Description</Label>
                <Textarea
                  id="domain"
                  value={formData.domain_description}
                  onChange={(e) => setFormData({ ...formData, domain_description: e.target.value })}
                  placeholder="B2B sales, enterprise deals, customer relationships"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectives">Key Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.key_objectives}
                  onChange={(e) => setFormData({ ...formData, key_objectives: e.target.value })}
                  placeholder="Sales strategy, pipeline optimization, deal closing"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Expert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-secondary/10 border-secondary">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-secondary p-3 border-brutal-sm">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-1">Expert Prompt Template</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Each expert uses a specialized prompt template with the fields you define: 
                <span className="font-bold text-foreground"> Role, Domain Description, and Key Objectives</span>. 
                These variables are injected into the AI system to create domain-specific advisors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experts Grid */}
      {experts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-muted p-6 border-brutal-sm">
              <Briefcase className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase mb-2">No Experts Yet</h3>
              <p className="text-muted-foreground font-medium">
                Create your first AI expert to get started
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Expert
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <Card key={expert.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="bg-accent p-2 border-brutal-sm mt-1">
                    <Briefcase className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{expert.name}</CardTitle>
                    <CardDescription className="mt-1">{expert.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {expert.domain_description && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Domain</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {expert.domain_description}
                    </p>
                  </div>
                )}
                {expert.key_objectives && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Objectives</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {expert.key_objectives}
                    </p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2">
                  Created: {formatDate(expert.createdAt)}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(expert)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(expert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expert</DialogTitle>
            <DialogDescription>Update expert configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Expert Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-domain">Domain Description</Label>
              <Textarea
                id="edit-domain"
                value={formData.domain_description}
                onChange={(e) => setFormData({ ...formData, domain_description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-objectives">Key Objectives</Label>
              <Textarea
                id="edit-objectives"
                value={formData.key_objectives}
                onChange={(e) => setFormData({ ...formData, key_objectives: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedExpert(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
