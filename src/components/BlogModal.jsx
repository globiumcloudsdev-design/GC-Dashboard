"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { blogService } from "@/services/blogService";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Upload, 
  FileText, 
  Image, 
  Link, 
  Globe,
  Eye,
  EyeOff
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function BlogModal({ open, onClose, onSaved, initial = null }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [category, setCategory] = useState("general");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setSlug(initial.slug || "");
      setContent(initial.content || "");
      setExcerpt(initial.excerpt || "");
      setTags((initial.tags || []).join(", "));
      setExistingAttachments(initial.attachments || []);
      setIsPublished(initial.published !== false);
      setCategory(initial.category || "general");
      setSlugEdited(!!initial.slug);
    } else {
      resetForm();
    }
  }, [initial, open]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setTags("");
    setFiles([]);
    setExistingAttachments([]);
    setSlugEdited(false);
    setIsPublished(true);
    setCategory("general");
  };

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

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

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      setLoading(true);

      const attachments = [...existingAttachments];
      
      // Upload new files if any
      if (files.length > 0) {
        const wrapped = await Promise.all(
          files.map(async (file) => ({ 
            name: file.name, 
            data: await toBase64(file) 
          }))
        );
        
        const uploadRes = await blogService.uploadAttachments(wrapped);
        if (uploadRes?.success) {
          for (const upload of uploadRes.data) {
            attachments.push({ 
              url: upload.url, 
              publicId: upload.publicId, 
              filename: upload.filename 
            });
          }
        }
      }

      // Prepare payload
      const payload = { 
        title, 
        slug, 
        content, 
        excerpt,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean), 
        attachments,
        published: isPublished,
        category
      };

      // Call API
      const res = initial 
        ? await blogService.update({ ...payload, id: initial._id }) 
        : await blogService.create(payload);

      if (res?.success) {
        toast.success(initial ? "Blog updated successfully" : "Blog created successfully");
        onSaved && onSaved(res.data);
        onClose && onClose();
        resetForm();
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

  const removeExistingAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    { value: "general", label: "General" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "education", label: "Education" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {initial ? "Edit Blog Post" : "Create New Blog Post"}
          </DialogTitle>
          <DialogDescription>
            {initial 
              ? "Make changes to your blog post here. Click save when you're done." 
              : "Fill in the details below to create a new blog post."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter blog title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="blog-post-url-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugEdited(true);
                    }}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be used in the URL: yoursite.com/blog/{slug || "your-slug"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content *</Label>
                    <span className="text-sm text-muted-foreground">
                      {content.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Write your blog content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] font-sans"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="technology, web, design"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.split(",").map((tag, index) => 
                        tag.trim() && (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief summary of your blog post"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be shown in blog listings and search results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload New Files</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop files here or click to browse
                    </p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFiles}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports images, PDFs, and documents
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>New Files ({files.length})</Label>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNewFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Existing Attachments ({existingAttachments.length})</Label>
                  </div>
                  
                  {existingAttachments.length === 0 ? (
                    <div className="text-center p-8 border rounded-lg">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No attachments yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {existingAttachments.map((attachment, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                          {attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={attachment.url}
                              alt={attachment.filename}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-2">
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="p-2 h-auto rounded-full"
                                onClick={() => removeExistingAttachment(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-2 bg-background">
                            <p className="text-xs truncate">{attachment.filename}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Publication</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Publish Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Control visibility of your blog post
                      </p>
                    </div>
                    <Switch
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {isPublished ? (
                      <>
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Public - Visible to everyone</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-600">Draft - Only visible to you</span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SEO Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      placeholder="SEO title (defaults to blog title)"
                      defaultValue={title}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      placeholder="SEO description"
                      defaultValue={excerpt}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">URL Structure</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full-slug">Full URL</Label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm">
                        https://yoursite.com/blog/
                      </span>
                      <Input
                        id="full-slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          setSlugEdited(true);
                        }}
                        className="rounded-l-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Canonical URL</Label>
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      <Input
                        placeholder="https://example.com/original-post"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 pt-4">
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{title || "Blog Title"}</h2>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>By: Admin</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge>{category}</Badge>
              </div>

              {excerpt && (
                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <p className="italic">{excerpt}</p>
                </div>
              )}

              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: (content || "Your content will appear here").replace(/\n/g, '<br />') 
                }} />
              </div>

              {tags && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.split(",").map((tag, index) => 
                      tag.trim() && (
                        <Badge key={index} variant="outline">
                          {tag.trim()}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : initial ? "Update Blog" : "Publish Blog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}