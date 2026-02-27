"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  RotateCw,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Filter,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAgent } from "@/context/AgentContext";
import { projectService } from "@/services/projectService";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AgentProjectsPage() {
  const { agent } = useAgent();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
        const myProjects = response.data.filter(
          (p) =>
            p.assignedAgent?._id === agent.id ||
            p.assignedAgent === agent.id ||
            (p.createdBy?._id === agent.id && p.creatorModel === "Agent"),
        );
        setProjects(myProjects);
      }
    } catch (error) {
      toast.error("Failed to load projects");
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
        creatorModel: editingProject ? editingProject.creatorModel : "Agent",
        updatedBy: agent.id,
        updaterModel: "Agent",
        // If agent creates it, they might assume it's assigned to them, or Unassigned initially?
        // Let's assume if they create it, they probably manage it, but maybe not 'assigned' for revenue unless specified
        // But the form has 'assignedAgent' field.
      };

      // Ensure price and assignedAgent are populated from form
      // The ProjectFormDialog handles the state `formData` based on inputs

      let response;
      if (editingProject) {
        response = await projectService.updateProject(
          editingProject._id,
          payload,
        );
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
      toast.error(error.response?.data?.error || "Failed to save project");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* --- HERO HEADER --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 px-6 pt-12 pb-24 rounded-[40px] mx-4 mt-4 shadow-2xl shadow-indigo-950/20 mb-[-60px]">
        {/* Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-black text-blue-400 uppercase tracking-widest border border-white/5">
                Sales Records
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              My{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Projects
              </span>
            </h1>
            <p className="text-indigo-200/60 font-medium">
              Manage your portfolio and track sales performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setEditingProject(null);
                setFormOpen(true);
              }}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Project Entry
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchProjects}
              className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all"
            >
              <RotateCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Projects",
              val: projects.length,
              icon: Briefcase,
              grad: "from-blue-600 to-indigo-700",
            },
            {
              label: "Completed",
              val: projects.filter(
                (p) => p.status === "Completed" || p.status === "Delivered",
              ).length,
              icon: CheckCircle2,
              grad: "from-emerald-500 to-teal-600",
            },
            {
              label: "In Progress",
              val: projects.filter((p) => p.status === "In Progress").length,
              icon: Clock,
              grad: "from-amber-500 to-orange-600",
            },
            {
              label: "Total Value",
              val: `₨ ${projects.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}`,
              icon: DollarSign,
              grad: "from-violet-600 to-purple-700",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group border-none shadow-xl shadow-slate-200/50 rounded-3xl p-5 bg-white">
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-[60px] transition-all group-hover:scale-110",
                    stat.grad,
                  )}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      "bg-gradient-to-br " + stat.grad,
                    )}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-xl font-black text-slate-900 truncate max-w-[150px]">
                      {stat.val}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search your projects by title or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 rounded-[24px] border-none shadow-lg shadow-slate-200/50 bg-white font-bold text-slate-700 placeholder:text-slate-400 focus-visible:ring-blue-500/20 transition-all text-base"
            />
          </div>
          <div className="flex items-center gap-2 h-16 px-4 bg-white rounded-[24px] shadow-lg shadow-slate-200/50 border-none shrink-0 overflow-hidden">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              View:
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-white shadow-sm text-blue-600"
              >
                <LayoutGrid size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* --- PROJECT GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Syncing your projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Briefcase className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              No project entries found
            </h3>
            <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
              Get started by creating your first project record to track your
              revenue.
            </p>
            <Button
              onClick={() => {
                setEditingProject(null);
                setFormOpen(true);
              }}
              variant="outline"
              className="mt-8 rounded-xl font-bold px-6 border-slate-200"
            >
              <Plus className="mr-2 h-4 w-4" /> Start New Entry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group overflow-hidden border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-[32px] bg-white h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-56 bg-slate-900 group-hover:h-48 transition-all duration-500 overflow-hidden">
                    {project.thumbnail?.url ? (
                      <img
                        src={project.thumbnail.url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-all duration-700 brightness-90 group-hover:brightness-100 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-900 to-slate-900 text-white/20">
                        <Briefcase className="h-16 w-16" />
                      </div>
                    )}

                    {/* Overlay status */}
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-lg",
                          project.status === "Completed" ||
                            project.status === "Delivered"
                            ? "bg-emerald-500 text-white"
                            : project.status === "In Progress"
                              ? "bg-blue-500 text-white"
                              : "bg-amber-500 text-white",
                        )}
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <div className="absolute bottom-4 left-6 right-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                        {project.category}
                      </p>
                      <h3 className="text-xl font-black text-white leading-tight line-clamp-1">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>

                    <div className="flex items-center justify-between py-4 border-y border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Deadline
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs mt-1">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          {project.deadline
                            ? format(new Date(project.deadline), "MMM d, yyyy")
                            : "Open"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#10B5DB]">
                          Revenue
                        </span>
                        <div className="font-black text-slate-900 text-lg mt-0.5">
                          ₨ {project.price?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleEdit(project)}
                      className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-[#10B5DB] text-white font-black transition-all group/btn"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <ProjectFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editingProject}
          onSubmit={handleSubmit}
          userType="agent"
          currentAgentId={agent?.id}
        />
      </div>
    </div>
  );
}
