"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layout,
  Zap,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { projectService } from "@/services/projectService";

export default function PortfolioSection() {
  const [projects, setProjects] = useState([
    {
      _id: "1",
      title: "Global FinTech Platform",
      shortDescription:
        "A high-performance trading platform for enterprise clients.",
      technologies: ["Next.js", "TypeScript", "Node.js"],
      slug: "fintech-platform",
      isActive: true,
      isFeatured: true,
    },
    {
      _id: "2",
      title: "AI Power Cloud",
      shortDescription:
        "Scalable cloud infrastructure optimized for AI workloads.",
      technologies: ["React", "AWS", "Python"],
      slug: "ai-cloud",
      isActive: true,
      isFeatured: true,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects({ limit: 100 });
        const activeProjects = response.data?.filter((p) => p.isActive) || [];

        if (response.success && activeProjects.length > 0) {
          const featured = activeProjects.filter((p) => p.isFeatured);
          setProjects(featured.length > 0 ? featured : activeProjects);
        }
      } catch (err) {
        console.warn("Using fallback projects due to:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [projects.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const getFloatingTags = (project) =>
    project.technologies || ["Next.js 14", "AI Integrated", "Enterprise"];

  const currentProject = projects.length > 0 ? projects[currentSlide] : null;

  return (
    <section
      id="portfolio"
      className="relative py-28 bg-[#0A0F14] overflow-hidden"
    >
      {/* Tech Background Detail */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#10B5DB08_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#10B5DB] animate-pulse" />
              <span className="text-[#10B5DB] font-bold tracking-[0.4em] text-[10px] uppercase">
                Selected Works
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              OUR{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B5DB] to-blue-400">
                IMPACT
              </span>
            </h2>
          </motion.div>
          <p className="text-gray-400 text-lg max-w-sm border-l border-[#10B5DB]/30 pl-6">
            Explore how we solve complex problems through code and creativity.
          </p>
        </div>

        {/* Portfolio Slider */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
            >
              {/* Text Content */}
              <div className="order-2 lg:order-1 space-y-8">
                <div className="space-y-6">
                  <span className="text-[#10B5DB] font-black text-7xl md:text-8xl opacity-10 block">
                    0{currentSlide + 1}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase group">
                    {currentProject.title}
                  </h3>
                  <p className="text-gray-400 text-xl leading-relaxed">
                    {currentProject.shortDescription ||
                      currentProject.description}
                  </p>
                </div>

                <div className="pt-4 flex gap-4">
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(16, 181, 219, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={`/projects/${currentProject.slug}`}
                      className="inline-flex items-center gap-3 bg-[#10B5DB] text-white font-bold px-10 py-5 rounded-2xl shadow-lg transition-all"
                    >
                      View Details <Eye className="w-5 h-5" />
                    </Link>
                  </motion.div>
                  {currentProject.liveUrl && (
                    <motion.a
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 20px rgba(16, 181, 219, 0.4)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      href={currentProject.liveUrl}
                      target="_blank"
                      className="inline-flex items-center gap-3 bg-white/10 border border-white/20 text-white font-bold px-10 py-5 rounded-2xl shadow-lg hover:bg-white/20 transition-all"
                    >
                      Live Demo <ExternalLink className="w-5 h-5" />
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Mockup Display */}
              <div className="order-1 lg:order-2 relative">
                {/* Glowing Aura Behind Image */}
                <div className="absolute -inset-4 bg-[#10B5DB]/20 rounded-[3rem] blur-3xl opacity-50" />

                <div className="relative p-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <div className="w-8 h-8 border-2 border-[#10B5DB]/20 border-t-[#10B5DB] rounded-full animate-spin" />
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#0A0F14]"
                  >
                    {currentProject.thumbnail?.url ? (
                      <img
                        src={currentProject.thumbnail.url}
                        alt={currentProject.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#10B5DB] text-8xl font-black italic opacity-20">
                        {currentProject.title?.charAt(0)}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Floating Tags (Tech Stack) */}
                {getFloatingTags(currentProject).map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                    transition={{
                      opacity: { delay: 0.5 + index * 0.1 },
                      y: {
                        repeat: Infinity,
                        duration: 4 + index,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute hidden md:block bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-2xl"
                    style={{
                      top: `${10 + index * 25}%`,
                      [index % 2 === 0 ? "left" : "right"]: "-1.5rem",
                    }}
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-20 border-t border-white/5 pt-10">
            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                className="p-5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-[#10B5DB] hover:border-[#10B5DB] transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="p-5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-[#10B5DB] hover:border-[#10B5DB] transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Custom Progress Bar */}
            <div className="hidden md:flex flex-col items-end gap-2 w-1/3">
              <div className="flex justify-between w-full text-[10px] font-black text-[#10B5DB] tracking-widest uppercase">
                <span>Phase</span>
                <span>
                  0{currentSlide + 1} / 0{projects.length}
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#10B5DB]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentSlide + 1) / projects.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
