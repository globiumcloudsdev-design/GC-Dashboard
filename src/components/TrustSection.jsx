"use client";
import { motion } from "framer-motion";
import { Shield, Code, Clock, Users, CheckCircle2 } from "lucide-react";

export default function TrustSection() {
  const trustPoints = [
    {
      icon: Shield,
      title: "Scalable Solutions",
      description: "Our solutions grow with your business, ensuring long-term success and adaptability."
    },
    {
      icon: Code,
      title: "Clean Code",
      description: "We deliver maintainable, well-documented code that follows industry best practices."
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "We respect your timelines and deliver projects on schedule without compromising quality."
    },
    {
      icon: Users,
      title: "Long-term Support",
      description: "Ongoing maintenance and support to keep your systems running smoothly."
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10B5DB]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-gray-100 pb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-[#10B5DB]" />
              <span className="text-[#10B5DB] font-bold tracking-[0.3em] text-xs uppercase">The Difference</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
              WHY BUSINESSES <br />
              <span className="text-[#10B5DB]">TRUST US</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 text-lg max-w-sm"
          >
            Engineering excellence combined with a deep commitment to your long-term growth.
          </motion.p>
        </div>

        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative h-full p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#10B5DB]/10 group-hover:border-[#10B5DB]/20 flex flex-col items-center text-center">
                
                {/* Icon Circle with Glow */}
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-[#10B5DB] rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[#10B5DB] group-hover:bg-[#10B5DB] group-hover:text-white transition-all duration-500">
                    <point.icon className="w-8 h-8" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight group-hover:text-[#10B5DB] transition-colors">
                  {point.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {point.description}
                </p>

                {/* Subtle Indicator */}
                <div className="mt-auto pt-4 w-full flex justify-center border-t border-gray-50">
                  <CheckCircle2 className="w-5 h-5 text-gray-200 group-hover:text-[#10B5DB] transition-colors duration-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}