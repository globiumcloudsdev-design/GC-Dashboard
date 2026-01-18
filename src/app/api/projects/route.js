import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/Models/Project';
import { sendEmail } from "@/lib/mailer";
import { getWebsiteConfig } from "@/lib/websiteConfig";
import { createBaseEmailTemplate, WEBSITE_CONFIG } from "@/lib/emailTemplates"; // Check if WEBSITE_CONFIG is exported
// If getWebsiteConfig is dynamic, use that.
// Let's check imports in booking route again
// import { getWebsiteConfig } from "@/lib/websiteConfig";
// And I need createBaseEmailTemplate from generic helper.


// GET - Fetch all projects
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const category = searchParams.get('category');
    const assignedAgent = searchParams.get('assignedAgent');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (assignedAgent) {
      filter.assignedAgent = assignedAgent;
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch projects
    const projects = await Project.find(filter)
      .populate('createdBy', 'firstName lastName agentName email')
      .populate('updatedBy', 'firstName lastName agentName email')
      .populate('assignedAgent', 'agentName agentId email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Project.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      projectType,
      technologies,
      frameworks,
      databases,
      tools,
      thumbnail,
      images,
      liveUrl,
      githubUrl,
      demoVideoUrl,
      documentationUrl,
      client,
      duration,
      completedAt,
      teamSize,
      features,
      displayOrder,
      isFeatured,
      metaTitle,
      metaDescription,
      createdBy,
      price,
      assignedAgent,
      deadline,
      status,
      creatorModel,
      updaterModel
    } = body;

    // Validation
    if (!title || !shortDescription || !thumbnail || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['title', 'shortDescription', 'thumbnail', 'createdBy'],
        },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = new Project({
      title,
      shortDescription,
      fullDescription: fullDescription || '',
      category: category || 'Web Application',
      projectType: projectType || 'Client Project',
      technologies: technologies || [],
      frameworks: frameworks || [],
      databases: databases || [],
      tools: tools || [],
      thumbnail,
      images: images || [],
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      demoVideoUrl: demoVideoUrl || '',
      documentationUrl: documentationUrl || '',
      client: client || { name: '', country: '' },
      duration: duration || '',
      completedAt: completedAt || null,
      teamSize: teamSize || 1,
      features: features || [],
      displayOrder: displayOrder || 0,
      isFeatured: isFeatured || false,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      createdBy,
      creatorModel: creatorModel || 'User',
      isActive: true,
      price: price ? parseFloat(price) : 0,
      assignedAgent: assignedAgent || null,
      deadline: deadline ? new Date(deadline) : null,
      status: status || 'Pending'
    });

    await newProject.save();

    // Dynamically populate based on model type
    if (newProject.creatorModel === 'User') {
        await newProject.populate('createdBy', 'firstName lastName email');
    } else {
        await newProject.populate('createdBy', 'agentName agentId email');
    }
    
    if (assignedAgent) await newProject.populate('assignedAgent', 'agentName agentId email');

    // Send Email Notifications
    try {
      // Fetch website config - basic fallback if function fails or returns specific format
      let config = {};
      try {
          config = await getWebsiteConfig() || {};
      } catch (e) {
          console.log("Config fetch failed, using defaults");
      }
      
      const ownerEmail = config.ownerEmail || 'shoaibrazamemon170@gmail.com'; // Fallback from emailTemplates
      const websiteName = config.name || 'Globium Clouds';
      
      const creatorName = newProject.creatorModel === 'User' 
        ? `${newProject.createdBy?.firstName} ${newProject.createdBy?.lastName}`
        : `${newProject.createdBy?.agentName} (${newProject.createdBy?.agentId})`;

      // 1. Notify Owner/Admin
      const ownerBody = `
        <div class="status-box status-pending"><p><strong>New Project Created</strong></p></div>
        <p>A new project <strong>${newProject.title}</strong> has been created.</p>
        <table class="data-table">
            <tr><td class="label">Created By:</td><td>${creatorName}</td></tr>
            <tr><td class="label">Price:</td><td>PKR ${newProject.price?.toLocaleString()}</td></tr>
            <tr><td class="label">Deadline:</td><td>${newProject.deadline ? new Date(newProject.deadline).toDateString() : 'N/A'}</td></tr>
             <tr><td class="label">Assigned To:</td><td>${newProject.assignedAgent ? newProject.assignedAgent.agentName : 'Unassigned'}</td></tr>
        </table>
      `;
      
      const ownerEmailHtml = createBaseEmailTemplate({
        ...config,
        brandColor: config.brandColor || "#007BFF", // Fallback
        websiteName: websiteName,
        emailTitle: "New Project Alert",
        preheader: `New Project: ${newProject.title}`,
        firstName: "Admin",
        messageBody: ownerBody,
        bookingDetailsHtml: '' 
      });

      await sendEmail({
        to: ownerEmail,
        subject: `New Project: ${newProject.title}`,
        html: ownerEmailHtml,
      });

      // 2. Notify Assigned Agent (if any and different from creator)
      if (newProject.assignedAgent && newProject.assignedAgent.email) {
          // Verify if agent didn't assign themselves (to avoid spamming themselves)
          // But "Confirmation" is requested. "Booking confirmation" -> Customer gets it.
          // So Creator should get it? Or Assigned Agent?
          // If Agent creates it, they get confirmation?
          // If Admin creates it and assigns Agent, Agent gets notification.
          
          const isSelfAssigned = (newProject.creatorModel === 'Agent' && newProject.createdBy?._id.toString() === newProject.assignedAgent._id.toString());
          
          if (!isSelfAssigned || true) { // Always send confirmation for now as per "booking confirmation" analogy
             const agentBody = `
                <div class="status-box status-confirmed"><p><strong>Project Assigned</strong></p></div>
                <p>You have been assigned to a new project: <strong>${newProject.title}</strong>.</p>
                <div class="info-box">
                    <h3>Project Details</h3>
                    <table class="data-table">
                        <tr><td class="label">Client:</td><td>${newProject.client?.name || 'N/A'}</td></tr>
                        <tr><td class="label">Revenue Target:</td><td>PKR ${newProject.price?.toLocaleString()}</td></tr>
                        <tr><td class="label">Deadline:</td><td>${newProject.deadline ? new Date(newProject.deadline).toDateString() : 'N/A'}</td></tr>
                    </table>
                </div>
             `;
             
             const agentEmailHtml = createBaseEmailTemplate({
                ...config,
                brandColor: config.brandColor || "#007BFF",
                websiteName: websiteName,
                emailTitle: "New Project Assignment",
                preheader: `Assignment: ${newProject.title}`,
                firstName: newProject.assignedAgent.agentName,
                messageBody: agentBody,
                bookingDetailsHtml: ''
             });

             await sendEmail({
                to: newProject.assignedAgent.email,
                subject: `Project Assignment: ${newProject.title}`,
                html: agentEmailHtml,
             });
          }
      }

    } catch (emailError) {
        console.error("Failed to send project emails", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
