"use client";
import { motion } from "framer-motion";
import { Cloud, Shield, Zap, Users, Database, Code, ArrowUpRight } from "lucide-react";

export default function ServicesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const services = [
    { icon: Cloud, title: "Cloud Infrastructure", description: "Scalable cloud solutions with AWS, Azure, and GCP. Deploy, manage, and optimize your cloud resources efficiently." },
    { icon: Shield, title: "Security & Compliance", description: "Enterprise-grade security solutions ensuring data protection, compliance, and risk management for your business." },
    { icon: Zap, title: "Performance Optimization", description: "Boost your application performance with advanced caching, CDN, and optimization techniques." },
    { icon: Users, title: "Team Collaboration", description: "Integrated collaboration tools and platforms to enhance team productivity and communication." },
    { icon: Database, title: "Data Management", description: "Comprehensive data solutions including databases, analytics, and data warehousing services." },
    { icon: Code, title: "Custom Development", description: "Tailored software development services to meet your unique business requirements and goals." }
  ];

  return (
    <section id="services" className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B5DB]/5 rounded-full blur-[120px] -mr-64 -mt-64" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[2px] bg-[#10B5DB]" />
            <span className="text-[#10B5DB] font-bold tracking-[0.3em] text-sm uppercase">Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">
            OUR <span className="text-[#10B5DB]">EXPERTISE</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            We don't just build software; we engineer <span className="text-gray-900 font-semibold underline decoration-[#10B5DB]/30">scalable ecosystems</span> that drive your business forward.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group relative bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:border-[#10B5DB]/30 transition-all duration-500 overflow-hidden"
            >
              {/* Background Numbering */}
              <span className="absolute top-4 right-8 text-8xl font-black text-gray-50 group-hover:text-[#10B5DB]/5 transition-colors duration-500 select-none">
                0{index + 1}
              </span>

              {/* Icon Container */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#10B5DB] transition-colors duration-500 shadow-inner">
                <service.icon className="w-7 h-7 text-[#10B5DB] group-hover:text-white transition-colors duration-500" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#10B5DB] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 italic group-hover:not-italic transition-all">
                  {service.description}
                </p>
                
                {/* Learn More link-style footer */}
                <div className="flex items-center gap-2 text-sm font-bold text-[#10B5DB] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  EXPLORE SOLUTIONS <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Decorative Line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#10B5DB] to-blue-600 group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}