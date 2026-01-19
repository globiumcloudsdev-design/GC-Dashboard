# 📰 Complete Blog System Documentation

## 🎯 System Overview

The GC-Dashboard Blog System is a complete content management solution for creating, managing, and publishing blog posts with rich media support, permission-based access control, and a modern user interface.

---

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary for image and media uploads
- **Authentication**: JWT-based auth with role-based permissions

---

## 📊 Database Schema

### **Blog Model** (`src/Models/Blog.js`)

```javascript
{
  // Basic Information
  title: String (required, trimmed),
  slug: String (required, unique, trimmed),
  excerpt: String (max 300 chars),
  content: String (required),
  
  // Media & Category
  featuredImage: String (Cloudinary URL),
  category: String (enum: General, Technology, Business, Design, Marketing, Development, Other),
  
  // Status & Publishing
  status: String (enum: draft, published, archived),
  publishedAt: Date,
  
  // Analytics
  viewCount: Number (default: 0),
  readingTime: Number (minutes, auto-calculated),
  
  // Attachments
  attachments: [{
    url: String,
    publicId: String,
    filename: String,
    uploadedAt: Date
  }],
  
  // Relationships
  author: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  
  // Flags
  isActive: Boolean (default: true),
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🔐 Permission System

### **Required Permissions**

The blog system uses the `blog` permission module with the following actions:

```javascript
{
  blog: {
    view: Boolean,    // View blog list and details
    create: Boolean,  // Create new blog posts
    edit: Boolean,    // Edit existing blog posts
    delete: Boolean,  // Delete blog posts
    export: Boolean,  // Export blog data
    approve: Boolean  // Approve blog posts (future feature)
  }
}
```

### **Permission Check Example**
```javascript
const { hasPermission } = useAuth();
const canCreate = hasPermission("blog", "create");
```

---

## 🛣️ API Routes

### **1. List Blogs** 
**GET** `/api/blogs`

**Query Parameters:**
- `q` - Search query (searches title and content)
- `tag` - Filter by tag
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "blogs": [...],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### **2. Create Blog**
**POST** `/api/blogs`

**Headers:**
- Cookie with JWT token (required)

**Body:**
```json
{
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "excerpt": "Brief description...",
  "content": "Full blog content...",
  "category": "Technology",
  "status": "draft",
  "featuredImage": "https://cloudinary.com/...",
  "readingTime": 5,
  "publishedAt": "2026-01-19T00:00:00Z",
  "attachments": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...blog object }
}
```

---

### **3. Get Single Blog**
**GET** `/api/blogs/[id]?id=123`

**Response:**
```json
{
  "success": true,
  "data": { ...blog object with populated author }
}
```

---

### **4. Update Blog**
**PUT** `/api/blogs/[id]?id=123`

**Body:** Same as create blog

**Response:**
```json
{
  "success": true,
  "data": { ...updated blog object }
}
```

---

### **5. Delete Blog**
**DELETE** `/api/blogs/[id]?id=123`

**Response:**
```json
{
  "success": true,
  "message": "Blog deleted"
}
```

---

### **6. Upload Attachments**
**POST** `/api/blogs/upload`

**Body:**
```json
{
  "files": [
    {
      "name": "image.png",
      "data": "data:image/png;base64,..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://cloudinary.com/...",
      "publicId": "blogs/abc123",
      "filename": "image.png"
    }
  ]
}
```

---

## 🎨 Frontend Components

### **1. CustomBlogModal**
**Location:** `src/components/CustomBlogModal.jsx`

**Features:**
- ✅ Auto-generates URL slug from title
- ✅ Calculates reading time automatically
- ✅ Featured image upload with preview
- ✅ Multiple attachment uploads
- ✅ Rich form with category and status
- ✅ Draft/Published/Archived status
- ✅ Character counter for excerpt (300 max)
- ✅ Word counter and reading time display
- ✅ Responsive full-width modal (max-w-6xl)
- ✅ Beautiful UI with Tailwind CSS
- ✅ Dark mode support

**Usage:**
```jsx
<CustomBlogModal 
  open={openModal} 
  onClose={() => setOpenModal(false)} 
  onSaved={handleSaved} 
  initial={editing} // null for create, blog object for edit
/>
```

---

### **2. BlogsPage**
**Location:** `src/app/(dashboard)/dashboard/blogs/page.jsx`

**Features:**
- ✅ Responsive card grid layout
- ✅ Permission-based action buttons
- ✅ Featured image thumbnails
- ✅ Blog preview with excerpt
- ✅ Author info and publish date
- ✅ Edit and delete actions
- ✅ Loading states with skeletons
- ✅ Empty state handling

---

### **3. Blog Service**
**Location:** `src/services/blogService.js`

**Methods:**
```javascript
blogService.list(opts)           // Get blogs list
blogService.create(payload)      // Create new blog
blogService.get(id)              // Get single blog
blogService.update(payload)      // Update blog
blogService.remove(id)           // Delete blog
blogService.uploadAttachments()  // Upload files
```

---

## 🔄 Complete Workflow

### **Creating a New Blog Post**

1. **User clicks "Create Blog"**
   - Check permission: `hasPermission("blog", "create")`
   - Open `CustomBlogModal` with `initial={null}`

2. **Fill in the form**
   - Enter title (slug auto-generates)
   - Add excerpt (optional, max 300 chars)
   - Write content (reading time auto-calculates)
   - Upload featured image
   - Select category and status
   - Add additional attachments

3. **Click "Create Blog"**
   - Validate required fields
   - Upload featured image to Cloudinary
   - Upload attachments to Cloudinary
   - Calculate reading time from content
   - POST to `/api/blogs` with JWT token
   - Server validates permissions
   - Save to MongoDB
   - Return success response

4. **Post-creation**
   - Modal closes
   - Blog list refreshes
   - Toast notification shows success
   - New blog appears in the list

---

### **Editing an Existing Blog**

1. **User clicks "Edit" on a blog card**
   - Check permission: `hasPermission("blog", "edit")`
   - Fetch blog data
   - Open `CustomBlogModal` with `initial={blogObject}`

2. **Modal pre-fills with existing data**
   - All fields populated
   - Featured image preview shown
   - Existing attachments displayed with remove option

3. **Make changes and save**
   - Upload new featured image (if changed)
   - Upload new attachments
   - Merge with existing attachments
   - PUT to `/api/blogs/[id]`
   - Update MongoDB record

---

### **Deleting a Blog**

1. **User clicks "Delete"**
   - Check permission: `hasPermission("blog", "delete")`
   - Show confirmation dialog

2. **Confirm deletion**
   - DELETE to `/api/blogs/[id]`
   - Remove from MongoDB
   - Refresh blog list

---

## 🔒 Security Features

### **Authentication**
- All write operations require JWT token in cookies
- Token verified on every API call
- User ID extracted from decoded token

### **Authorization**
- Permission checks on frontend (UI control)
- Permission checks on backend (future enhancement)
- Role-based access control via AuthContext

### **Data Validation**
- Required fields enforced in schema
- Unique slug constraint
- Input sanitization
- File type validation

---

## 📁 File Structure

```
src/
├── Models/
│   └── Blog.js                          # MongoDB schema
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── blogs/
│   │           └── page.jsx            # Blog list page
│   └── api/
│       └── blogs/
│           ├── route.js                # List & Create
│           ├── [id]/
│           │   └── route.js           # Get, Update, Delete
│           └── upload/
│               └── route.js           # Upload attachments
├── components/
│   └── CustomBlogModal.jsx            # Blog create/edit modal
└── services/
    └── blogService.js                 # API client wrapper
```

---

## 🚀 Key Features

### ✨ **Automatic Features**
1. **Slug Generation** - Auto-generated from title (editable)
2. **Reading Time** - Calculated based on word count (200 words/min)
3. **Timestamps** - Auto-managed by MongoDB
4. **Author Assignment** - Auto-set from JWT token

### 📸 **Media Management**
1. **Featured Image** - Single hero image for blog
2. **Multiple Attachments** - Unlimited additional images/files
3. **Cloudinary Integration** - Secure cloud storage
4. **Preview & Remove** - Edit existing attachments

### 📝 **Content Features**
1. **Rich Text Support** - Full Markdown/HTML content
2. **Excerpt** - Short summary (300 char limit)
3. **Categories** - Organized content taxonomy
4. **Status Management** - Draft → Published → Archived

### 🎯 **User Experience**
1. **Responsive Design** - Works on mobile, tablet, desktop
2. **Dark Mode** - Full theme support
3. **Loading States** - Smooth UX with skeletons
4. **Toast Notifications** - Clear feedback
5. **Validation** - Real-time form validation

---

## 🐛 Common Issues & Solutions

### **Upload Timeout Errors**
**Problem:** `Request Timeout` when uploading files

**Solutions:**
1. Check Cloudinary environment variables:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. Reduce file sizes (compress images before upload)

3. Use multipart/form-data instead of base64 (future enhancement)

---

### **Slug Already Exists**
**Problem:** Error when slug is not unique

**Solution:** 
- Edit the slug manually
- System shows error message with clear feedback

---

### **Permission Denied**
**Problem:** User cannot create/edit/delete

**Solution:**
1. Check user role in database
2. Verify role has `blog` permissions
3. Update role permissions in `/dashboard/users` page

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Rich text editor (TinyMCE/Quill)
- [ ] SEO meta fields (title, description, keywords)
- [ ] Comments system
- [ ] Like/Share functionality
- [ ] Multi-language support
- [ ] Scheduled publishing
- [ ] Version history
- [ ] Related posts
- [ ] Search with filters
- [ ] Export to PDF/Markdown
- [ ] Email notifications
- [ ] Analytics dashboard

### **Technical Improvements**
- [ ] Server-side permission enforcement
- [ ] Image optimization on upload
- [ ] Lazy loading for blog list
- [ ] Infinite scroll pagination
- [ ] Full-text search with MongoDB Atlas
- [ ] GraphQL API (optional)
- [ ] Redis caching
- [ ] CDN integration

---

## 📚 Usage Examples

### **Create a Blog Programmatically**
```javascript
import { blogService } from '@/services/blogService';

const newBlog = await blogService.create({
  title: "Getting Started with Next.js",
  slug: "getting-started-nextjs",
  excerpt: "Learn the basics of Next.js...",
  content: "Full content here...",
  category: "Technology",
  status: "published",
  featuredImage: "https://...",
  readingTime: 5,
  publishedAt: new Date(),
  attachments: []
});
```

---

### **Query Blogs with Filters**
```javascript
// Search blogs
const results = await blogService.list({
  q: "nextjs",
  page: 1,
  limit: 10
});

// Filter by tag
const techBlogs = await blogService.list({
  tag: "technology"
});
```

---

## 🎓 Best Practices

### **For Content Creators**
1. Always add a featured image
2. Write compelling excerpts (under 300 chars)
3. Use appropriate categories
4. Save as draft before publishing
5. Proofread content before publishing

### **For Developers**
1. Always validate input on both client and server
2. Use TypeScript for type safety
3. Handle errors gracefully
4. Optimize images before upload
5. Add loading states for better UX
6. Test permissions thoroughly
7. Keep the API RESTful

---

## 📞 Support & Troubleshooting

For issues or questions:
1. Check this documentation first
2. Review error logs in browser console
3. Check server logs for API errors
4. Verify Cloudinary configuration
5. Test permissions in user management

---

## 📄 License & Credits

Part of GC-Dashboard System
Built with Next.js, React, MongoDB, and Cloudinary
© 2026 Globium Clouds

---

**Last Updated:** January 19, 2026
**Version:** 1.0.0
**Author:** GC Development Team
