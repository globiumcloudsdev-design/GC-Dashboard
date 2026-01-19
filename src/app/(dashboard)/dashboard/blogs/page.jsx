
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CustomBlogModal from "@/components/CustomBlogModal";
import { blogService } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  User, 
  FileText,
  Eye,
  Clock,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BlogsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("blog", "create");
  const canEdit = hasPermission("blog", "edit");
  const canDelete = hasPermission("blog", "delete");

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await blogService.list({ page: 1, limit: 50 });
      if (res?.success) setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blogs");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(()=>{ load(); }, []);

  const handleSaved = (newBlog) => {
    load();
    toast.success(editing ? "Blog updated successfully" : "Blog created successfully");
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      const blog = blogs.find(b => b._id === blogId);
      if (!blog) return;
      
      const res = await blogService.update({
        id: blogId,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        status: newStatus,
        excerpt: blog.excerpt,
        category: blog.category,
        featuredImage: blog.featuredImage,
        readingTime: blog.readingTime,
        attachments: blog.attachments || [],
      });
      
      if (res?.success) {
        load();
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  const handleEdit = (blog) => { 
    setEditing(blog); 
    setOpenModal(true); 
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    
    try {
      const res = await blogService.remove(selectedBlog._id);
      if (res?.success) {
        load();
        toast.success("Blog deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedBlog(null);
      }
    } catch (err) { 
      console.error(err);
      toast.error("Failed to delete blog");
    }
  };

  const openDeleteDialog = (blog) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const openPreview = (blog) => {
    setSelectedBlog(blog);
    setPreviewOpen(true);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your blog posts
          </p>
        </div>
        {canCreate && (
          <Button 
            onClick={()=>{ setEditing(null); setOpenModal(true); }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Blog
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">
              All published blogs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {blogs.filter(blog => {
                const blogDate = new Date(blog.createdAt);
                const now = new Date();
                return blogDate.getMonth() === now.getMonth() && 
                       blogDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Blogs created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently published
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Manage all your blog posts from this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No blogs yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get started by creating your first blog post
              </p>
              {canCreate && (
                <Button 
                  onClick={()=>{ setEditing(null); setOpenModal(true); }}
                  className="mt-4"
                >
                  Create Blog
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {blog.featuredImage ? (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <div className="font-semibold hover:text-primary cursor-pointer mb-1" 
                               onClick={() => openPreview(blog.content)}>
                            {blog.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {blog.excerpt || blog.content?.slice(0, 80) + "..."}
                          </div>
                          {blog.readingTime && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {blog.readingTime} min read
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{blog.category || "General"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(blog.author?.firstName, blog.author?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            {blog.author?.firstName} {blog.author?.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canEdit ? (
                          <Select
                            value={blog.status || "draft"}
                            onValueChange={(value) => handleStatusChange(blog._id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue>
                                <Badge 
                                  variant={blog.status === "published" ? "default" : blog.status === "draft" ? "secondary" : "outline"}
                                  className={blog.status === "published" ? "bg-green-500" : blog.status === "archived" ? "bg-gray-500" : ""}
                                >
                                  {blog.status || "draft"}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Draft</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="published">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-500">Published</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="archived">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-gray-500">Archived</Badge>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge 
                            variant={blog.status === "published" ? "default" : blog.status === "draft" ? "secondary" : "outline"}
                            className={blog.status === "published" ? "bg-green-500" : blog.status === "archived" ? "bg-gray-500" : ""}
                          >
                            {blog.status || "draft"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(blog.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openPreview(blog)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(blog)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(blog)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {blogs.length} of {blogs.length} blogs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Blog Modal */}
      <CustomBlogModal 
        open={openModal} 
        onClose={()=>{
          setOpenModal(false);
          setEditing(null);
        }} 
        onSaved={handleSaved} 
        initial={editing} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              "{selectedBlog?.title}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom Wide Preview Modal */}
      {previewOpen && selectedBlog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="h-7 w-7 text-primary" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Blog Preview</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewOpen(false)}
                className="rounded-full"
                aria-label="Close preview"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Featured Image */}
                {selectedBlog.featuredImage && (
                  <img
                    src={selectedBlog.featuredImage}
                    alt={selectedBlog.title}
                    className="w-full md:w-2/5 h-80 object-cover rounded-xl border"
                  />
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedBlog.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-5 w-5" />
                        {selectedBlog.author?.firstName} {selectedBlog.author?.lastName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-5 w-5" />
                        {formatDate(selectedBlog.createdAt)}
                      </div>
                      {selectedBlog.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-5 w-5" />
                          {selectedBlog.readingTime} min read
                        </div>
                      )}
                      <Badge variant="outline">{selectedBlog.category}</Badge>
                    </div>
                  </div>
                  {selectedBlog.excerpt && (
                    <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4 mt-2">
                      {selectedBlog.excerpt}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="prose dark:prose-invert max-w-none text-lg">
                <div dangerouslySetInnerHTML={{
                  __html: selectedBlog.content.replace(/\n/g, '<br />')
                }} />
              </div>
              {selectedBlog.attachments && selectedBlog.attachments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedBlog.attachments.map((att, idx) => (
                      <img
                        key={idx}
                        src={att.url}
                        alt={att.filename}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Modal Footer */}
            <div className="flex items-center justify-end px-8 py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}