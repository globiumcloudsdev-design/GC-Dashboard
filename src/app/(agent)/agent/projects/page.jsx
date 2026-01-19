"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RotateCw, Briefcase, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAgent } from '@/context/AgentContext';
import { projectService } from '@/services/projectService';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { format } from 'date-fns';

export default function AgentProjectsPage() {
  const { agent } = useAgent();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!agent) return;
    setLoading(true);
    try {
      // Fetch projects assigned to this agent OR created by this agent
      // Note: We might need to adjust the API to allow filtering by 'assignedAgent' specifically
      // For now, we'll fetch all and filter client-side or use existing filters if API supports
      
      // Ideally: GET /api/projects?assignedAgent=AGENT_ID or ?createdBy=AGENT_ID
      // Assuming update to Project API to handle filtering
      const response = await projectService.getProjects({ limit: 100 }); 
      
      if (response.success) {
        // Filter for this agent
        const myProjects = response.data.filter(p => 
          (p.assignedAgent?._id === agent.id) || 
          (p.assignedAgent === agent.id) ||
          (p.createdBy?._id === agent.id && p.creatorModel === 'Agent')
        );
        setProjects(myProjects);
      }
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [agent]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (formData) => {
    if (!agent) return;

    try {
      const payload = {
        ...formData,
        createdBy: editingProject ? editingProject.createdBy._id : agent.id, // Keep original creator if editing
        creatorModel: editingProject ? editingProject.creatorModel : 'Agent',
        updatedBy: agent.id,
        updaterModel: 'Agent',
        // If agent creates it, they might assume it's assigned to them, or Unassigned initially?
        // Let's assume if they create it, they probably manage it, but maybe not 'assigned' for revenue unless specified
        // But the form has 'assignedAgent' field.
      };

      // Ensure price and assignedAgent are populated from form
      // The ProjectFormDialog handles the state `formData` based on inputs

      let response;
      if (editingProject) {
        response = await projectService.updateProject(editingProject._id, payload);
      } else {
        response = await projectService.createProject(payload);
      }

      if (response.success) {
        toast.success(response.message);
        setFormOpen(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
            <p className="text-slate-600 mt-1">Manage your assigned projects and track progress</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setEditingProject(null); setFormOpen(true); }} className="bg-blue-600">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
            <Button variant="outline" size="icon" onClick={fetchProjects}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Briefcase className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm text-slate-500">Total Projects</p>
                   <p className="text-xl font-bold">{projects.length}</p>
                </div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm text-slate-500">Completed</p>
                   <p className="text-xl font-bold">{projects.filter(p => p.status === 'Completed' || p.status === 'Delivered').length}</p>
                </div>
            </Card>
             <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm text-slate-500">In Progress</p>
                   <p className="text-xl font-bold">{projects.filter(p => p.status === 'In Progress').length}</p>
                </div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <span className="font-bold text-lg text-cyan-700">PKR</span>
                </div>
                <div>
                   <p className="text-sm text-slate-500">Total Value</p>
                   <p className="text-xl font-bold">
                     {projects.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
                   </p>
                </div>
            </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                        placeholder="Search projects..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
        </Card>

        {/* Project Grid */}
        {loading ? (
             <div className="text-center py-20 text-slate-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                <div className="mx-auto h-12 w-12 text-slate-300">
                    <Briefcase className="h-full w-full" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No projects found</h3>
                <p className="mt-1 text-sm text-slate-500">Get started by creating a new project.</p>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredProjects.map(project => (
                     <Card key={project._id} className="overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-48 bg-slate-100">
                            {project.thumbnail?.url ? (
                                <img 
                                    src={project.thumbnail.url} 
                                    alt={project.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <Briefcase className="h-12 w-12" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge className={`${
                                    project.status === 'Completed' ? 'bg-green-500' :
                                    project.status === 'In Progress' ? 'bg-blue-500' :
                                    project.status === 'Pending' ? 'bg-yellow-500' : 'bg-slate-500'
                                }`}>
                                    {project.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{project.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{project.shortDescription}</p>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar className="h-4 w-4" />
                                    {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No Deadline'}
                                </div>
                                <div className="font-medium text-slate-900">
                                    PKR {project.price?.toLocaleString() || '0'}
                                </div>
                            </div>
                            
                            <div className="pt-2 border-t flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                     </Card>
                 ))}
             </div>
        )}

        <ProjectFormDialog 
            open={formOpen} 
            onOpenChange={setFormOpen}
            initialData={editingProject}
            onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
