"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { blogService } from "@/services/blogService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (params.slug) {
      loadBlog();
    }
  }, [params.slug]);

  const loadBlog = async () => {
    try {
      const res = await blogService.list({ page: 1, limit: 50 });
      if (res?.success) {
        const foundBlog = res.data.blogs.find(b => b.slug === params.slug && b.status === "published");
        if (foundBlog) {
          setBlog(foundBlog);
          
          // Load related blogs (same category)
          const related = res.data.blogs
            .filter(b => b.category === foundBlog.category && b._id !== foundBlog._id && b.status === "published")
            .slice(0, 3);
          setRelatedBlogs(related);
        } else {
          toast.error("Blog not found");
          router.push("/blogs");
        }
      }
    } catch (err) {
      console.error("Failed to load blog:", err);
      toast.error("Failed to load blog");
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

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title;
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F14]">
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-32">
          <div className="text-center">
            <p className="text-lg text-gray-300">Loading blog...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0A0F14]">
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-32">
          <div className="text-center">
            <p className="text-xl text-gray-300">Blog not found</p>
            <Button onClick={() => router.push("/blogs")} className="mt-6 bg-[#10B5DB] hover:bg-[#0a7a9a]">
              Back to Blogs
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F14]">
      <Header />
      
      {/* Hero Section with Featured Image */}
      <section className="relative pt-24 bg-[#0A0F14] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040%20L40%2040%20L40%200%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff10%22%20stroke-width%3D%220.5%22/%3E%3C/svg%3E')] opacity-20"></div>
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#10B5DB]/20 rounded-full blur-[150px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/blogs")}
              className="gap-2 text-white hover:bg-white/10 hover:text-[#10B5DB] px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </motion.div>

          {/* Blog Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <Badge className="mb-6 bg-[#10B5DB] text-white border-0 px-4 py-1.5 text-sm font-semibold">
              {blog.category}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] text-white tracking-tight">
              {blog.title}
            </h1>
            
            {blog.excerpt && (
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
              {blog.author && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#10B5DB] to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">
                      {blog.author.firstName} {blog.author.lastName}
                    </div>
                    <div className="text-sm text-gray-400">Author</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              {blog.readingTime && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span>{blog.readingTime} min read</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Featured Image - Large & Centered */}
          {blog.featuredImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(16,181,219,0.4)] border border-white/10"
            >
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Blog Content */}
      <article className="relative py-20 bg-[#0A0F14] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">

          {/* Blog Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: blog.content.replace(/\n/g, '<br />')
              }}
              className="text-lg text-gray-300 leading-[1.8] [&>br]:my-4"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
              }}
            />
          </motion.div>

          {/* Attachments */}
          {blog.attachments && blog.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-black mb-8 text-white">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blog.attachments.map((att, idx) => (
                  <div key={idx} className="group relative rounded-2xl overflow-hidden">
                    <img
                      src={att.url}
                      alt={att.filename}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <Separator className="my-16 bg-white/10" />

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Share This Article</h3>
              <p className="text-gray-400 mb-6">Help others discover this content</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("facebook")}
                  className="rounded-xl bg-white/5 border-white/20 hover:bg-[#1877F2] hover:border-[#1877F2] text-white transition-all duration-300 px-6"
                >
                  <Facebook className="h-5 w-5 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("twitter")}
                  className="rounded-xl bg-white/5 border-white/20 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] text-white transition-all duration-300 px-6"
                >
                  <Twitter className="h-5 w-5 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("linkedin")}
                  className="rounded-xl bg-white/5 border-white/20 hover:bg-[#0A66C2] hover:border-[#0A66C2] text-white transition-all duration-300 px-6"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("copy")}
                  className="rounded-xl bg-white/5 border-white/20 hover:bg-[#10B5DB] hover:border-[#10B5DB] text-white transition-all duration-300 px-6"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-3xl md:text-4xl font-black mb-10 text-white text-center">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <motion.div
                    key={relatedBlog._id}
                    whileHover={{ y: -8 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-[#10B5DB]/50 hover:shadow-[0_20px_60px_-15px_rgba(16,181,219,0.4)] transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/blogs/${relatedBlog.slug}`)}
                  >
                    {relatedBlog.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedBlog.featuredImage}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <Badge className="absolute top-4 right-4 bg-[#10B5DB] text-white border-0">
                          {relatedBlog.category}
                        </Badge>
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="text-lg font-bold mb-3 line-clamp-2 text-white group-hover:text-[#10B5DB] transition-colors">
                        {relatedBlog.title}
                      </h4>
                      {relatedBlog.excerpt && (
                        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                          {relatedBlog.excerpt}
                        </p>
                      )}
                      {relatedBlog.readingTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {relatedBlog.readingTime} min read
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
