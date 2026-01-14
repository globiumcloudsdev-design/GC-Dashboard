'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Clock, Globe, Database, Wrench, Code, Layers } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { projectService } from '@/services/projectService';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // First try to get by slug, if not found, try by ID
        let response = await projectService.getProjectById(slug);

        if (!response.success) {
          // If slug didn't work, it might be an ID
          response = await projectService.getProjectById(slug);
        }

        if (response.success) {
          setProject(response.data);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#10B5DB]/20 border-t-[#10B5DB] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#10B5DB] text-white px-6 py-3 rounded-xl hover:bg-[#10B5DB]/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F14]">
      <Header />

      {/* Navigation */}
  


  <br /> <br />  <br /> <br />               
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[#10B5DB] font-bold tracking-[0.4em] text-[10px] uppercase">Project Details</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                  {project.title}
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                  {project.fullDescription || project.shortDescription}
                </p>
              </div>

              {/* Project Meta */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#10B5DB]" />
                    <span className="text-gray-400">
                      {project.completedAt ? new Date(project.completedAt).getFullYear() : 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#10B5DB]" />
                    <span className="text-gray-400">Team Size: {project.teamSize}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#10B5DB]" />
                    <span className="text-gray-400">{project.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-[#10B5DB]" />
                    <span className="text-gray-400">{project.category}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#10B5DB] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-[#10B5DB]/80 transition-all"
                  >
                    <Globe className="w-5 h-5" />
                    Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Github className="w-5 h-5" />
                    Source Code
                  </a>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#10B5DB]/20 rounded-[3rem] blur-3xl opacity-50" />
              <div className="relative p-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#0A0F14]"
                >
                  {project.thumbnail?.url ? (
                    <img
                      src={project.thumbnail.url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#10B5DB] text-8xl font-black italic opacity-20">
                      {project.title?.charAt(0)}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {project.technologies && project.technologies.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-6 h-6 text-[#10B5DB]" />
                  <h3 className="text-xl font-bold text-white">Technologies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-[#10B5DB]/10 border border-[#10B5DB]/20 text-[#10B5DB] px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.frameworks && project.frameworks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="w-6 h-6 text-[#10B5DB]" />
                  <h3 className="text-xl font-bold text-white">Frameworks</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.frameworks.map((framework, index) => (
                    <span
                      key={index}
                      className="bg-[#10B5DB]/10 border border-[#10B5DB]/20 text-[#10B5DB] px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {framework}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.databases && project.databases.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-[#10B5DB]" />
                  <h3 className="text-xl font-bold text-white">Databases</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.databases.map((db, index) => (
                    <span
                      key={index}
                      className="bg-[#10B5DB]/10 border border-[#10B5DB]/20 text-[#10B5DB] px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {db}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tools && project.tools.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="w-6 h-6 text-[#10B5DB]" />
                  <h3 className="text-xl font-bold text-white">Tools</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="bg-[#10B5DB]/10 border border-[#10B5DB]/20 text-[#10B5DB] px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Section */}
        {project.features && project.features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.features.map((feature, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gallery Section */}
        {project.images && project.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.images.map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl">
                  <img
                    src={image.url}
                    alt={image.caption || `Project image ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-center px-4">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Client Info */}
        {project.client && (project.client.name || project.client.country) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Client Information</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.client.name && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Client</h3>
                    <p className="text-gray-400">{project.client.name}</p>
                  </div>
                )}
                {project.client.country && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Location</h3>
                    <p className="text-gray-400">{project.client.country}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
