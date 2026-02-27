# GC-Dashboard

A comprehensive full-stack web application built with Next.js for Globium Clouds, a leading software development company in Pakistan. The application combines a professional marketing website with a powerful internal dashboard system for managing business operations.

## 🌟 Features

### Public Website
- **Modern Landing Page**: Hero section, services, portfolio, team showcase
- **Technology Stack Display**: Showcasing expertise in various technologies
- **Blog System**: Content management for company updates and insights
- **Contact Integration**: Lead capture and inquiry management
- **SEO Optimized**: Complete metadata, structured data, and sitemap generation
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Internal Dashboard
- **Agent Management**: Complete CRUD operations for agents and users
- **Attendance System**: Real-time tracking with location-based check-ins
- **Booking Management**: Service booking system with calendar integration
- **Sales & Analytics**: Comprehensive sales tracking and reporting
- **Payroll System**: Automated payroll calculations and management
- **Campaign Management**: Newsletter and marketing campaign tools
- **Notification System**: Real-time notifications and alerts
- **Role-Based Access Control**: Granular permissions system
- **Leave Management**: Employee leave request and approval workflow
- **Promo Code System**: Discount and promotional code management

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### Backend & Database
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **NextAuth.js** - Authentication and session management
- **JWT** - JSON Web Token for secure authentication

### Additional Libraries
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management and validation
- **Date-fns** - Modern date utility library
- **Chart.js/Recharts** - Data visualization
- **Cloudinary** - Image hosting and optimization
- **Nodemailer** - Email sending capabilities
- **Google APIs** - Calendar and other Google service integrations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gc-dashboard.git
   cd gc-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```




3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
gc-dashboard/
├── public/                 # Static assets
│   ├── images/            # Image assets
│   └── ...
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── api/           # API routes
│   │   ├── blogs/         # Blog pages
│   │   ├── layout.js      # Root layout
│   │   └── page.js        # Home page
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components (Radix-based)
│   │   ├── common/       # Shared components
│   │   └── ...           # Feature-specific components
│   ├── context/          # React contexts
│   ├── lib/              # Utility libraries
│   ├── Models/           # MongoDB models
│   ├── services/         # Business logic services
│   ├── utils/            # Helper functions
│   └── ...
├── package.json
├── tailwind.config.js
├── next.config.mjs
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run postbuild` - Generate sitemap (runs after build)

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and structure
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 Documentation

Additional documentation can be found in the following files:
- `TODO.md` - Current development tasks and optimizations
- `AGENT_SALES_SYSTEM.md` - Agent sales system documentation
- `ATTENDANCE_SYSTEM.md` - Attendance tracking documentation
- `TEAMS_DOCUMENTATION.md` - Team management guide

## 📞 Support

For support or questions:
- Email: globiumclouds@gmail.com
- Website: https://globiumclouds.com
- LinkedIn: [Globium Clouds](https://linkedin.com/company/globiumclouds)

## 📝 License

This project is proprietary software owned by Globium Clouds. All rights reserved.

## 🏆 Acknowledgments

- Built with ❤️ by the Globium Clouds development team
- Special thanks to our contributors and the open-source community

---

**Globium Clouds** - Transforming ideas into digital reality
