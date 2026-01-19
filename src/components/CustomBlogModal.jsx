"use client";

import { useState, useEffect } from "react";
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { blogService } from "@/services/blogService";

export default function CustomBlogModal({ open, onClose, onSaved, initial = null }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [content, setContent] = useState(initial?.content || "");
  const [category, setCategory] = useState(initial?.category || "General");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage || "");
  const [featuredFile, setFeaturedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState(initial?.attachments || []);
  const [slugEdited, setSlugEdited] = useState(!!initial?.slug);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setSlug(initial?.slug || "");
      setExcerpt(initial?.excerpt || "");
      setContent(initial?.content || "");
      setCategory(initial?.category || "General");
      setStatus(initial?.status || "draft");
      setFeaturedImage(initial?.featuredImage || "");
      setExistingAttachments(initial?.attachments || []);
      setSlugEdited(!!initial?.slug);
      setFiles([]);
      setFilePreviews([]);
      setFeaturedFile(null);
    }
  }, [open, initial]);

  const slugify = (str) => {
    return str
      .toString()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (v) => {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const handleFeaturedImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedFile(file);
      const reader = new FileReader();
      reader.onload = () => setFeaturedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFiles = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
    
    // Create preview URLs for new files
    const previews = f.map(file => ({
      url: URL.createObjectURL(file),
      filename: file.name
    }));
    setFilePreviews(previews);
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  const handleSubmit = async () => {
    if (!title || !slug || !content) {
      toast.error("Title, slug and content are required");
      return;
    }

    try {
      setLoading(true);

      let uploadedFeaturedImage = featuredImage;
      if (featuredFile) {
        const wrapped = [{ name: featuredFile.name, data: await toBase64(featuredFile) }];
        const uploadRes = await blogService.uploadAttachments(wrapped);
        if (uploadRes?.success && uploadRes.data[0]) {
          uploadedFeaturedImage = uploadRes.data[0].url;
        }
      }

      const attachments = [...existingAttachments];
      if (files.length) {
        const wrapped = await Promise.all(files.map(async (f) => ({ name: f.name, data: await toBase64(f) })));
        const uploadRes = await blogService.uploadAttachments(wrapped);
        if (uploadRes?.success) {
          for (const u of uploadRes.data) attachments.push({ url: u.url, publicId: u.publicId, filename: u.filename });
        }
      }

      const readingTime = calculateReadingTime(content);
      const payload = {
        title,
        slug,
        excerpt,
        content,
        category,
        status,
        featuredImage: uploadedFeaturedImage,
        readingTime,
        attachments,
        publishedAt: status === 'published' ? new Date() : null
      };

      const res = initial
        ? await blogService.update({ ...payload, id: initial._id })
        : await blogService.create(payload);

      if (res?.success) {
        toast.success(initial ? "Blog updated successfully" : "Blog created successfully");
        onSaved && onSaved(res.data);
        onClose && onClose();
      } else {
        toast.error(res?.message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving blog");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initial ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fill in the details below to {initial ? "update" : "publish"} your blog post
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter blog title..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="blog-url-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blogs/{slug || "your-slug-here"}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt (Short Description)
                </label>
                <Textarea
                  placeholder="Brief summary of your blog post (max 300 characters)..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                  className="h-20 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{excerpt.length}/300 characters</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Blog Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Write your blog content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-96 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.split(/\s+/).filter(Boolean).length} words • ~{calculateReadingTime(content)} min read
                </p>
              </div>

              {/* Additional Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Images/Files
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFiles}
                    className="hidden"
                    id="attachments-upload"
                  />
                  <label
                    htmlFor="attachments-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (max 10MB each)</span>
                  </label>
                </div>

                {(existingAttachments.length > 0 || filePreviews.length > 0) && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {existingAttachments.map((a, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <img
                          src={a.url}
                          alt={a.filename}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingAttachments((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {filePreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative group">
                        <img
                          src={preview.url}
                          alt={preview.filename}
                          className="h-24 w-full object-cover rounded-lg border-2 border-green-500"
                        />
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">New</div>
                        <button
                          type="button"
                          onClick={() => {
                            setFiles((prev) => prev.filter((_, i) => i !== idx));
                            setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {featuredImage ? (
                    <div className="relative group">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage("");
                          setFeaturedFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImage}
                        className="hidden"
                        id="featured-upload"
                      />
                      <label htmlFor="featured-upload" className="cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Upload Featured Image
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Publication Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Published
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Archived
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Publishing Info
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Slug is auto-generated from title</li>
                  <li>• Reading time calculated automatically</li>
                  <li>• Featured image appears in blog list</li>
                  <li>• Draft posts are not publicly visible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500">
            {initial ? "Last updated: " + new Date(initial.updatedAt).toLocaleDateString() : "New post"}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : initial ? "Update Blog" : "Create Blog"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
