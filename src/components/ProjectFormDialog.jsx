'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Plus, GripVertical, Image as ImageIcon, Sparkles, Layout, Code2, Globe, FileText, DollarSign, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { projectService } from '@/services/projectService';

export function ProjectFormDialog({ open, onOpenChange, onSubmit, isLoading, initialData = null, userType = 'admin', currentAgentId = null }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = projectService.getCategories();
  const projectTypes = projectService.getProjectTypes();

  // New states for sales
  const [revenueAgents, setRevenueAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const isAgentUser = userType === 'agent';

  // Fetch revenue agents
  useEffect(() => {
    async function fetchRevenueAgents() {
      setAgentsLoading(true);
      try {
        const res = await fetch('/api/agents?targetType=amount&limit=100');
        const json = await res.json();
        if (json.success) {
          setRevenueAgents(json.agents || []);
        }
      } catch (error) {
        console.error("Failed to fetch revenue agents", error);
      } finally {
        setAgentsLoading(false);
      }
    }
    
    if (open) {
      fetchRevenueAgents();
    }
  }, [open]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Web Application',
    projectType: 'Client Project',
    technologies: [],
    frameworks: [],
    databases: [],
    tools: [],
    liveUrl: '',
    githubUrl: '',
    demoVideoUrl: '',
    documentationUrl: '',
    client: { name: '', country: '' },
    duration: '',
    teamSize: 1,
    features: [],
    displayOrder: 0,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Images state
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // Tech stack input states
  const [techInput, setTechInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [dbInput, setDbInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  // Feature input states
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          shortDescription: initialData.shortDescription || '',
          fullDescription: initialData.fullDescription || '',
          category: initialData.category || 'Web Application',
          projectType: initialData.projectType || 'Client Project',
          technologies: initialData.technologies || [],
          frameworks: initialData.frameworks || [],
          databases: initialData.databases || [],
          tools: initialData.tools || [],
          liveUrl: initialData.liveUrl || '',
          githubUrl: initialData.githubUrl || '',
          demoVideoUrl: initialData.demoVideoUrl || '',
          documentationUrl: initialData.documentationUrl || '',
          client: initialData.client || { name: '', country: '' },
          duration: initialData.duration || '',
          teamSize: initialData.teamSize || 1,
          features: initialData.features || [],
          displayOrder: initialData.displayOrder || 0,
          isFeatured: initialData.isFeatured || false,
          metaTitle: initialData.metaTitle || '',
          metaDescription: initialData.metaDescription || '',
          // New fields
          price: initialData.price || '',
          assignedAgent: initialData.assignedAgent?._id || (isAgentUser ? currentAgentId : ''),
          deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
          status: initialData.status || 'Pending',
          progress: initialData.progress || 0
        });
        setThumbnail(initialData.thumbnail || null);
        setImages(initialData.images || []);
      } else {
        resetForm();
      }
    }
  }, [open, initialData, isAgentUser, currentAgentId]);

  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      fullDescription: '',
      category: 'Web Application',
      projectType: 'Client Project',
      technologies: [],
      frameworks: [],
      databases: [],
      tools: [],
      liveUrl: '',
      githubUrl: '',
      demoVideoUrl: '',
      documentationUrl: '',
      client: { name: '', country: '' },
      duration: '',
      teamSize: 1,
      features: [],
      displayOrder: 0,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      // New fields
      price: '',
      assignedAgent: isAgentUser ? currentAgentId : '',
      deadline: '',
      status: 'Pending',
      progress: 0
    });
    setThumbnail(null);
    setImages([]);
    setNewFiles([]);
    setActiveTab('basic');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Tech stack handlers
  const addTech = (type, value, setter) => {
    if (!value.trim()) return;
    const fieldMap = {
      tech: 'technologies',
      framework: 'frameworks',
      db: 'databases',
      tool: 'tools',
    };
    const field = fieldMap[type];
    if (!formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
    setter('');
  };

  const removeTech = (type, index) => {
    const fieldMap = {
      tech: 'technologies',
      framework: 'frameworks',
      db: 'databases',
      tool: 'tools',
    };
    const field = fieldMap[type];
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Feature handlers
  const addFeature = () => {
    if (!featureTitle.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: featureTitle.trim(), description: featureDesc.trim() }],
    }));
    setFeatureTitle('');
    setFeatureDesc('');
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Image handlers
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create previews
    const previews = await Promise.all(
      validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result,
              isNew: true,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setNewFiles(prev => [...prev, ...previews]);

    // Set first image as thumbnail if none exists
    if (!thumbnail && previews.length > 0) {
      setThumbnail({
        url: previews[0].preview,
        isNew: true,
        file: previews[0].file,
      });
    }
  };

  const removeImage = (index, isNew = false) => {
    if (isNew) {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const setAsThumbnail = (image, isNew = false) => {
    if (isNew) {
      setThumbnail({
        url: image.preview,
        isNew: true,
        file: image.file,
      });
    } else {
      setThumbnail({
        url: image.url,
        publicId: image.publicId,
        isNew: false,
      });
    }
    toast.success('Thumbnail set successfully');
  };

  // Upload images
  const uploadNewImages = async () => {
    if (newFiles.length === 0) return [];

    setUploading(true);
    try {
      const files = newFiles.map(f => f.file);
      const response = await projectService.uploadImages(files, 'portfolio-projects');

      if (response.success) {
        return response.data.images;
      }
      throw new Error('Failed to upload images');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload images');
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Short description is required');
      setActiveTab('basic');
      return;
    }
    if (!thumbnail) {
      toast.error('Please select a thumbnail');
      setActiveTab('images');
      return;
    }

    try {
      // Upload new images if any
      let uploadedImages = [];
      if (newFiles.length > 0) {
        uploadedImages = await uploadNewImages();
        if (uploadedImages === null) return;
      }

      // Prepare thumbnail
      let finalThumbnail = thumbnail;
      if (thumbnail.isNew) {
        // Find the uploaded thumbnail
        const thumbIndex = newFiles.findIndex(f => f.preview === thumbnail.url);
        if (thumbIndex !== -1 && uploadedImages[thumbIndex]) {
          finalThumbnail = {
            url: uploadedImages[thumbIndex].url,
            publicId: uploadedImages[thumbIndex].publicId,
          };
        }
      }

      // Combine existing and new images
      const allImages = [
        ...images.map((img, i) => ({ ...img, order: i })),
        ...uploadedImages.map((img, i) => ({ ...img, order: images.length + i })),
      ];

      // Prepare final data
      const finalData = {
        ...formData,
        assignedAgent: (formData.assignedAgent === 'unassigned' || formData.assignedAgent === '') ? null : formData.assignedAgent,
        thumbnail: finalThumbnail,
        images: allImages,
      };

      await onSubmit(finalData);
      resetForm();
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Submit error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
        {/* --- PREMIUM HEADER --- */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 pt-14 pb-10 px-10 text-white relative overflow-hidden shrink-0 rounded-t-[32px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full -ml-24 -mb-24 blur-[60px]" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 px-2 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                  Agent Dashboard
                </div>
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-lg">
                  {initialData ? <RotateCw className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </div>
                {initialData ? 'Update Sale Entry' : 'Upload New Sale'}
              </DialogTitle>
              <p className="text-blue-50 text-sm font-medium opacity-80 mt-2 max-w-md">
                Enter your project details, tech stack, and revenue information to track your monthly performance.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden">
            <div className="px-8 pt-6 pb-2 border-b border-slate-100 bg-slate-50/50">
              <TabsList className="w-full h-12 p-1 bg-slate-200/50 rounded-2xl grid grid-cols-5 gap-1">
                {[
                  { id: 'basic', label: 'Info', icon: Layout },
                  { id: 'tech', label: 'Stack', icon: Code2 },
                  { id: 'images', label: 'Images', icon: ImageIcon },
                  { id: 'links', label: 'URLs', icon: Globe },
                  { id: 'details', label: 'Features', icon: FileText },
                ].map((t) => (
                  <TabsTrigger 
                    key={t.id} 
                    value={t.id}
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold text-xs flex items-center gap-2"
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-8 py-6 h-[50vh]">
              {/* --- BASIC INFO TAB --- */}
              <TabsContent value="basic" className="space-y-6 mt-0 focus-visible:ring-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Project Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., E-commerce App Redesign"
                      className="h-12 px-4 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50/30"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="shortDescription" className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">The Elevator Pitch *</Label>
                    <Textarea
                      id="shortDescription"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      placeholder="Give a catchy 1-2 sentence overview of the project"
                      className="rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/30 min-h-[80px]"
                      maxLength={300}
                    />
                    <div className="flex justify-end">
                      <span className={`text-[10px] font-bold ${formData.shortDescription.length > 280 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {formData.shortDescription.length}/300
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- SALES FOCUS SECTION --- */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 p-6 space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <DollarSign className="h-16 w-16" />
                  </div>
                  
                  <div className="flex items-center gap-3 border-b border-blue-100/50 pb-4">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-widest">Revenue & Status</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-[#10B5DB]">Log Revenue (PKR)</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₨</div>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="pl-10 h-12 rounded-xl border-white bg-white shadow-sm focus:border-blue-500 transition-all font-bold text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-[#10B5DB]">Project Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="h-12 px-4 rounded-xl border-white bg-white shadow-sm font-bold">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          {['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled', 'On Hold'].map((st) => (
                            <SelectItem key={st} value={st} className="rounded-lg my-1 font-medium">
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-[#10B5DB]">Delivery Deadline</Label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          className="pl-12 h-12 rounded-xl border-white bg-white shadow-sm font-bold"
                        />
                      </div>
                    </div>

                    {!isAgentUser && (
                      <div className="space-y-2">
                        <Label htmlFor="assignedAgent" className="text-[10px] font-black uppercase tracking-widest text-[#10B5DB]">Assign Revenue To</Label>
                        <Select
                            value={formData.assignedAgent}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, assignedAgent: value }))}
                            disabled={agentsLoading}
                        >
                            <SelectTrigger className="h-12 px-4 rounded-xl border-white bg-white shadow-sm font-bold">
                                <SelectValue placeholder={agentsLoading ? "Loading..." : "Select Agent"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="unassigned" className="font-bold text-slate-400">Unassigned</SelectItem>
                                {revenueAgents.map((agent) => (
                                    <SelectItem key={agent._id} value={agent._id} className="rounded-lg my-1">
                                        {agent.agentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Type</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <div>
                      <Label className="text-sm font-bold text-slate-900">Featured Portfolio Project</Label>
                      <p className="text-[10px] text-slate-500 font-medium">Display this prominently on your agent profile</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tech Stack Tab */}
              <TabsContent value="tech" className="space-y-4 mt-0">
                {/* Technologies */}
                <div className="space-y-2">
                  <Label>Technologies / Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g., JavaScript, Python"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('tech', techInput, setTechInput))}
                    />
                    <Button type="button" onClick={() => addTech('tech', techInput, setTechInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {tech}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('tech', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Frameworks */}
                <div className="space-y-2">
                  <Label>Frameworks / Libraries</Label>
                  <div className="flex gap-2">
                    <Input
                      value={frameworkInput}
                      onChange={(e) => setFrameworkInput(e.target.value)}
                      placeholder="e.g., React, Next.js, Django"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('framework', frameworkInput, setFrameworkInput))}
                    />
                    <Button type="button" onClick={() => addTech('framework', frameworkInput, setFrameworkInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.frameworks.map((fw, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {fw}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('framework', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Databases */}
                <div className="space-y-2">
                  <Label>Databases</Label>
                  <div className="flex gap-2">
                    <Input
                      value={dbInput}
                      onChange={(e) => setDbInput(e.target.value)}
                      placeholder="e.g., MongoDB, PostgreSQL"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('db', dbInput, setDbInput))}
                    />
                    <Button type="button" onClick={() => addTech('db', dbInput, setDbInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.databases.map((db, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {db}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('db', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <Label>Tools / Services</Label>
                  <div className="flex gap-2">
                    <Input
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      placeholder="e.g., Docker, AWS, Vercel"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('tool', toolInput, setToolInput))}
                    />
                    <Button type="button" onClick={() => addTech('tool', toolInput, setToolInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tools.map((tool, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {tool}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('tool', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-0">
                {/* Thumbnail Preview */}
                <div className="space-y-2">
                  <Label>Thumbnail *</Label>
                  {thumbnail ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-500">
                      <Image
                        src={thumbnail.url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500">Thumbnail</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-gray-500">Upload images and select a thumbnail</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="space-y-2">
                  <Label>Project Images</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={uploading}
                  >
                    <Upload className="mr-2" size={16} />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </div>

                {/* Existing Images */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Existing Images ({images.length})</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border">
                          <Image
                            src={img.url}
                            alt={`Image ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setAsThumbnail(img, false)}
                              title="Set as thumbnail"
                            >
                              <ImageIcon size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(i, false)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          {thumbnail?.url === img.url && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-blue-500 text-xs">Thumb</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {newFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>New Images ({newFiles.length})</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {newFiles.map((file, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-green-500">
                          <Image
                            src={file.preview}
                            alt={`New ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setAsThumbnail(file, true)}
                              title="Set as thumbnail"
                            >
                              <ImageIcon size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(i, true)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          {thumbnail?.url === file.preview && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-blue-500 text-xs">Thumb</Badge>
                            </div>
                          )}
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-green-500 text-xs">New</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                  <Input
                    id="demoVideoUrl"
                    name="demoVideoUrl"
                    value={formData.demoVideoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentationUrl">Documentation URL</Label>
                  <Input
                    id="documentationUrl"
                    name="documentationUrl"
                    value={formData.documentationUrl}
                    onChange={handleInputChange}
                    placeholder="https://docs.your-project.com"
                  />
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client.name">Client Name</Label>
                    <Input
                      id="client.name"
                      name="client.name"
                      value={formData.client.name}
                      onChange={handleInputChange}
                      placeholder="Client or company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client.country">Client Country</Label>
                    <Input
                      id="client.country"
                      name="client.country"
                      value={formData.client.country}
                      onChange={handleInputChange}
                      placeholder="e.g., USA, UK, Pakistan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      min="1"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="Lower number = higher priority"
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label>Key Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder="Feature title"
                      className="flex-1"
                    />
                    <Input
                      value={featureDesc}
                      onChange={(e) => setFeatureDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <GripVertical size={16} className="text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{feature.title}</p>
                          {feature.description && (
                            <p className="text-xs text-gray-500">{feature.description}</p>
                          )}
                        </div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeFeature(i)}>
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

              </TabsContent>
            </ScrollArea>
          </Tabs>

            <DialogFooter className="p-6 pt-2 h-24 shrink-0 bg-slate-50 border-t items-center px-8">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-12 px-6 rounded-xl font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploading}
                className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                {isLoading || uploading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    {initialData ? 'Update Record' : 'Log Sale Entry'}
                  </>
                )}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
