"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogService } from "@/services/blogService";

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await blogService.list({ page: 1, limit: 3 });
      if (res?.success) {
        // Only show published blogs
        const publishedBlogs = (res.data.blogs || []).filter(blog => blog.status === "published");
        setBlogs(publishedBlogs.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Latest Blog Posts</h2>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section id="blog" className="relative py-20 bg-[#0A0F14] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040%20L40%2040%20L40%200%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff10%22%20stroke-width%3D%220.5%22/%3E%3C/svg%3E')] opacity-30"></div>
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[#10B5DB]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Latest Insights
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            LATEST BLOG POSTS
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Insights, updates, and stories from our team
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-[#10B5DB]/50 hover:shadow-[0_10px_40px_-10px_rgba(16,181,219,0.3)] transition-all duration-300 group cursor-pointer"
              onClick={() => router.push(`/blogs/${blog.slug}`)}
            >
              {/* Featured Image */}
              {blog.featuredImage && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#10B5DB] text-white border-0">
                      {blog.category}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#10B5DB] transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                {blog.excerpt && (
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(blog.createdAt)}
                    </div>
                    {blog.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blog.readingTime} min
                      </div>
                    )}
                  </div>
                </div>

                {/* Author */}
                {blog.author && (
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#10B5DB] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {blog.author.firstName} {blog.author.lastName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push("/blogs")}
            className="h-14 px-10 text-lg font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(16,181,219,0.5)] bg-[#10B5DB] hover:bg-[#0a7a9a] text-white"
          >
            View All Blogs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
