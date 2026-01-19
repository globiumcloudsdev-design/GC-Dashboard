# Newsletter Campaign System Documentation

## Overview
Complete newsletter subscription and email campaign management system for Globium Clouds dashboard. Allows users to subscribe via website footer and admins to create and send email campaigns to all subscribers.

---

## Features

### 1. Newsletter Subscription
- ✅ Footer subscription form with email validation
- ✅ Automatic welcome email on subscription
- ✅ Status management (active, unsubscribed, bounced)
- ✅ Source tracking for analytics
- ✅ Duplicate email prevention with reactivation

### 2. Campaign Management
- ✅ Full CRUD operations for campaigns
- ✅ Campaign status tracking (draft, scheduled, sending, sent, failed)
- ✅ Schedule campaigns for future sending
- ✅ Send to all active subscribers
- ✅ Recipient tracking (total, sent, failed)
- ✅ HTML email template with brand styling

### 3. Admin Dashboard
- ✅ Newsletter subscribers page with stats
- ✅ Campaign management page
- ✅ Export subscribers to CSV
- ✅ Search and filter functionality
- ✅ Permission-based access control

---

## Database Models

### Newsletter Model
**Location:** `src/Models/Newsletter.js`

```javascript
{
  email: String (unique, required),
  status: Enum ["active", "unsubscribed", "bounced"],
  subscribedAt: Date,
  unsubscribedAt: Date,
  source: String (e.g., "website", "landing-page")
}
```

### Campaign Model
**Location:** `src/Models/Campaign.js`

```javascript
{
  title: String (required),
  subject: String (required),
  content: String (required, HTML),
  status: Enum ["draft", "scheduled", "sending", "sent", "failed"],
  scheduledAt: Date,
  sentAt: Date,
  createdBy: ObjectId (ref: User),
  recipients: {
    total: Number,
    sent: Number,
    failed: Number
  },
  isActive: Boolean
}
```

---

## API Routes

### Newsletter API

#### POST /api/newsletter
Subscribe to newsletter
```javascript
// Request
{
  "email": "user@example.com",
  "source": "footer" // optional
}

// Response
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

#### GET /api/newsletter
Get all subscribers (authenticated)
```javascript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "email": "user@example.com",
      "status": "active",
      "subscribedAt": "2024-01-15T10:30:00Z",
      "source": "footer"
    }
  ]
}
```

### Campaign API

#### GET /api/campaigns
Get all campaigns
```javascript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Monthly Newsletter - January",
      "subject": "Updates from Globium Clouds",
      "content": "<p>Email content...</p>",
      "status": "sent",
      "recipients": {
        "total": 150,
        "sent": 148,
        "failed": 2
      },
      "sentAt": "2024-01-20T09:00:00Z",
      "createdBy": { ... }
    }
  ]
}
```

#### GET /api/campaigns/[id]
Get single campaign
```javascript
// Response
{
  "success": true,
  "data": { ... }
}
```

#### POST /api/campaigns
Create new campaign
```javascript
// Request
{
  "title": "Monthly Newsletter - January",
  "subject": "Updates from Globium Clouds",
  "content": "<p>Email content...</p>",
  "status": "draft",
  "scheduledAt": "2024-01-25T09:00:00Z" // optional
}

// Response
{
  "success": true,
  "data": { ... }
}
```

#### PUT /api/campaigns/[id]
Update campaign
```javascript
// Request
{
  "title": "Updated Title",
  "subject": "Updated Subject",
  "content": "<p>Updated content...</p>",
  "status": "scheduled"
}

// Response
{
  "success": true,
  "data": { ... }
}
```

#### DELETE /api/campaigns/[id]
Delete campaign
```javascript
// Response
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

#### POST /api/campaigns/[id]/send
Send campaign to all active subscribers
```javascript
// Response
{
  "success": true,
  "data": {
    "sent": 148,
    "failed": 2,
    "total": 150
  }
}
```

---

## Email Templates

### Newsletter Confirmation Email
**Location:** `src/lib/email.js` → `emailTemplates.newsletterConfirmation`

Sent when user subscribes to newsletter.

**Features:**
- Cyan gradient header (#10B5DB to #0070f3)
- Welcome message with subscription benefits
- Social media links (LinkedIn, Facebook, Instagram)
- Globium Clouds branding
- Responsive design

### Campaign Email
**Location:** `src/lib/email.js` → `emailTemplates.campaignEmail`

Sent for marketing campaigns.

**Features:**
- Brand-styled header with campaign title
- HTML content from campaign
- Social media links
- Unsubscribe footer
- Responsive design

---

## Frontend Components

### Footer Newsletter Form
**Location:** `src/components/Footer.jsx`

Newsletter subscription form in website footer.

**Features:**
- Email input with validation
- Loading state during submission
- Toast notifications for success/error
- Disabled state during submission
- Integration with /api/newsletter

### Newsletter Subscribers Page
**Location:** `src/app/(dashboard)/dashboard/news-letter/page.jsx`

Admin page to view all newsletter subscribers.

**Features:**
- Statistics cards (Total, Active, Unsubscribed, Bounced)
- Search by email
- Export to CSV
- Status badges with icons
- Responsive table
- Permission-based access

### Campaigns Page
**Location:** `src/app/(dashboard)/dashboard/campaigns/page.jsx`

Admin page to manage email campaigns.

**Features:**
- Create/Edit campaign modal
- Campaign status badges
- Recipient tracking display
- Send campaign button
- Delete campaign
- Schedule campaigns
- HTML content editor
- Permission-based actions
- Loading states

---

## Service Layer

### Campaign Service
**Location:** `src/services/campaignService.js`

Client-side API wrapper for campaign operations.

**Methods:**
- `list()` - Get all campaigns
- `get(id)` - Get single campaign
- `create(payload)` - Create new campaign
- `update(id, payload)` - Update campaign
- `remove(id)` - Delete campaign
- `send(id)` - Send campaign to subscribers

---

## Permissions

Required permissions for newsletter features:

```javascript
{
  module: "newsletter",
  actions: ["view", "create", "edit", "delete"]
}
```

**Permission Checks:**
- View Subscribers: `newsletter.view`
- View Campaigns: `newsletter.view`
- Create Campaign: `newsletter.create`
- Edit Campaign: `newsletter.edit`
- Delete Campaign: `newsletter.delete`
- Send Campaign: Requires `newsletter.edit` or `newsletter.create`

---

## Navigation

### Sidebar Links
**Location:** `src/components/Sidebar.jsx`

Two menu items added:
1. **News Letter** → `/dashboard/news-letter`
   - Icon: UsersRound
   - Shows subscriber list and stats

2. **Campaigns** → `/dashboard/campaigns`
   - Icon: Mail
   - Campaign management interface

---

## Usage Guide

### For End Users (Website Visitors)

1. **Subscribe to Newsletter:**
   - Scroll to website footer
   - Enter email address in newsletter form
   - Click "Subscribe" button
   - Receive welcome email confirmation

### For Admins

#### View Subscribers
1. Navigate to **Dashboard → News Letter**
2. View subscriber statistics
3. Search for specific subscribers
4. Export to CSV if needed

#### Create Campaign
1. Navigate to **Dashboard → Campaigns**
2. Click "New Campaign" button
3. Fill in campaign details:
   - Campaign Title (internal reference)
   - Email Subject (what users see)
   - Email Content (HTML supported)
   - Status (Draft or Scheduled)
   - Schedule Date (optional)
4. Click "Create Campaign"

#### Send Campaign
1. Navigate to **Dashboard → Campaigns**
2. Find campaign in table (status must be Draft or Scheduled)
3. Click green "Send" icon
4. Confirm sending
5. Wait for completion
6. View sent/failed statistics

#### Edit Campaign
1. Navigate to **Dashboard → Campaigns**
2. Click pencil "Edit" icon on campaign
3. Modify details
4. Click "Update Campaign"
5. Note: Sent campaigns cannot be edited

#### Delete Campaign
1. Navigate to **Dashboard → Campaigns**
2. Click red "Trash" icon on campaign
3. Confirm deletion

---

## Email Sending Process

When a campaign is sent:

1. Campaign status changes to "sending"
2. Fetch all active newsletter subscribers
3. For each subscriber:
   - Generate email from template
   - Send via Nodemailer
   - Track success/failure
4. Update campaign:
   - Status: "sent" or "failed"
   - `sentAt` timestamp
   - `recipients.sent` count
   - `recipients.failed` count

**Error Handling:**
- Individual email failures don't stop the process
- Failed sends are counted and displayed
- If entire process fails, status set to "failed"

---

## HTML Content Guidelines

When creating campaign content, you can use full HTML:

**Example Content:**
```html
<h2 style="color: #10B5DB;">Welcome to January Updates!</h2>
<p>Dear valued subscriber,</p>
<p>We're excited to share our latest updates with you:</p>
<ul>
  <li>New cloud infrastructure features</li>
  <li>Performance improvements</li>
  <li>Security updates</li>
</ul>
<p>Visit our <a href="https://globiumclouds.com">website</a> to learn more.</p>
<p>Best regards,<br/>Globium Clouds Team</p>
```

**Note:** Content will be wrapped in email template automatically, including:
- Brand header
- Styled container
- Social media links
- Footer with copyright

---

## Environment Variables

Required for email functionality:

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
SMTP_FROM_NAME=Globium Clouds
```

---

## CSV Export Format

Exported subscriber CSV includes:

```csv
Email,Status,Source,Subscribed At
user@example.com,active,footer,1/15/2024
another@example.com,active,landing-page,1/16/2024
```

---

## Status Definitions

### Newsletter Status
- **active**: Subscribed and receiving emails
- **unsubscribed**: User opted out
- **bounced**: Email delivery failed permanently

### Campaign Status
- **draft**: Being created, not sent
- **scheduled**: Set for future sending
- **sending**: Currently in progress
- **sent**: Successfully completed
- **failed**: Sending failed

---

## Security Features

1. **Authentication Required:**
   - All admin endpoints require JWT token
   - Token verified via `verifyToken` middleware

2. **Permission Checks:**
   - Role-based access control
   - Actions require specific permissions

3. **Validation:**
   - Email format validation
   - Required field checks
   - Status enum enforcement

4. **Rate Limiting:**
   - Consider adding rate limiting to prevent spam
   - Cloudflare or Express rate limiter recommended

---

## Best Practices

### Creating Campaigns
1. Always preview content before sending
2. Use descriptive campaign titles for reference
3. Test email with your own address first
4. Schedule campaigns during business hours
5. Monitor failed sends and investigate

### Managing Subscribers
1. Regularly export backups
2. Monitor bounced emails
3. Clean inactive subscribers periodically
4. Respect unsubscribe requests
5. Comply with email marketing laws (CAN-SPAM, GDPR)

### HTML Content
1. Keep content concise
2. Use inline CSS for styling
3. Test across email clients
4. Include plain text alternative
5. Add clear call-to-action

---

## Troubleshooting

### Subscription Issues
**Problem:** Subscription form not working
- Check network tab for API errors
- Verify email format
- Check toast notifications for error messages

**Problem:** Welcome email not received
- Verify email credentials in .env
- Check spam folder
- Review server logs for errors

### Campaign Issues
**Problem:** Campaign stuck in "sending"
- Check server logs for errors
- Verify email credentials
- May need manual status update in database

**Problem:** High failure rate
- Check subscriber email validity
- Verify SMTP settings
- Review email content for spam triggers

---

## Future Enhancements

Potential improvements:
- [ ] Email templates library
- [ ] A/B testing for campaigns
- [ ] Detailed analytics (open rate, click rate)
- [ ] Subscriber segmentation
- [ ] Automated drip campaigns
- [ ] Rich text editor for content
- [ ] Email preview before sending
- [ ] Scheduled sending queue
- [ ] Bounce handling automation
- [ ] Unsubscribe link in emails

---

## File Structure

```
src/
├── Models/
│   ├── Newsletter.js           # Newsletter subscriber schema
│   └── Campaign.js              # Campaign schema
├── app/
│   ├── api/
│   │   ├── newsletter/
│   │   │   └── route.js         # Subscribe & list subscribers
│   │   └── campaigns/
│   │       ├── route.js         # List & create campaigns
│   │       └── [id]/
│   │           ├── route.js     # Get, update, delete campaign
│   │           └── send/
│   │               └── route.js # Send campaign
│   └── (dashboard)/
│       └── dashboard/
│           ├── news-letter/
│           │   └── page.jsx     # Subscribers management
│           └── campaigns/
│               └── page.jsx      # Campaign management
├── components/
│   ├── Footer.jsx               # Newsletter subscription form
│   └── Sidebar.jsx              # Navigation with links
├── services/
│   └── campaignService.js       # Client API wrapper
└── lib/
    └── email.js                 # Email templates & sender
```

---

## Support

For issues or questions:
- Check server logs for errors
- Review API responses in network tab
- Verify permissions in user role
- Contact development team

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Maintainer:** Globium Clouds Development Team
