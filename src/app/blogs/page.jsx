"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { blogService } from "@/services/blogService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await blogService.list({ page: 1, limit: 50 });
      if (res?.success) {
        // Only show published blogs
        const publishedBlogs = (res.data.blogs || []).filter(
          (blog) => blog.status === "published",
        );
        setBlogs(publishedBlogs);
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
      month: "long",
      day: "numeric",
    });
  };

  const categories = ["all", ...new Set(blogs.map((blog) => blog.category))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0F14]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-[#0A0F14] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040%20L40%2040%20L40%200%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff10%22%20stroke-width%3D%220.5%22/%3E%3C/svg%3E')] opacity-30"></div>
          <div className="absolute top-20 -right-20 w-96 h-96 bg-[#10B5DB]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                Latest Insights
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              OUR BLOG
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Insights, updates, and stories from our team
            </p>

            {/* Search and Filter Control Center */}
            <div className="max-w-3xl mx-auto mt-12 mb-10 group">
              <div className="relative p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#10B5DB]/30">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  {/* Search Field */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#10B5DB] h-5 w-5 opacity-60 pointer-events-none" />
                    <Input
                      placeholder="Search for articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 pl-14 pr-6 bg-white/5 border-transparent focus:border-transparent focus:ring-0 text-white placeholder:text-gray-500 rounded-[1.4rem] transition-all text-base"
                    />
                  </div>

                  {/* Vertical Divider (Desktop) */}
                  <div className="hidden md:block w-px h-8 bg-white/10" />

                  {/* Category Filter */}
                  <div className="relative w-full md:w-[220px]">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full h-14 pl-4 pr-6 bg-transparent border-transparent focus:ring-0 text-white rounded-[1.4rem] hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <Filter className="h-4 w-4 text-[#10B5DB] opacity-60" />
                          <SelectValue placeholder="All Categories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0D1219]/95 backdrop-blur-2xl border-white/10 text-white rounded-2xl shadow-3xl">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="focus:bg-[#10B5DB]/20 focus:text-white cursor-pointer rounded-lg mx-1 py-3"
                          >
                            {cat === "all" ? "All Categories" : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="relative py-20 bg-[#0A0F14] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040%20L40%2040%20L40%200%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff10%22%20stroke-width%3D%220.5%22/%3E%3C/svg%3E')] opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center">
              <p className="text-lg text-gray-300">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-300">No blogs found</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-300">
                  Showing {filteredBlogs.length}{" "}
                  {filteredBlogs.length === 1 ? "blog" : "blogs"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-[#10B5DB]/50 hover:shadow-[0_10px_40px_-10px_rgba(16,181,219,0.3)] transition-all duration-300 group cursor-pointer"
                    onClick={() => router.push(`/blogs/${blog.slug}`)}
                  >
                    {/* Featured Image */}
                    {blog.featuredImage && (
                      <div className="relative h-56 overflow-hidden">
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
                            {blog.author.firstName?.[0]}
                            {blog.author.lastName?.[0]}
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
