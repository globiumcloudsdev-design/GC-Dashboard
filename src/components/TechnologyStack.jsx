"use client";
import { motion } from "framer-motion";
import { FaMobileAlt, FaCloud, FaLaptopCode, FaRobot, FaShoppingCart, FaLock } from "react-icons/fa";

export default function TechnologyStack() {
  const services = [
    { name: "Custom Software", icon: <FaLaptopCode /> },
    { name: "Web Applications", icon: <FaLaptopCode /> },
    { name: "Mobile Development", icon: <FaMobileAlt /> },
    { name: "E-commerce", icon: <FaShoppingCart /> },
    { name: "AI & ML", icon: <FaRobot /> },
    { name: "Cloud Computing", icon: <FaCloud /> },
    { name: "UI/UX Design", icon: <FaLaptopCode /> },
    { name: "Cybersecurity", icon: <FaLock /> },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F14]">
      {/* Dynamic Background Grid for Tech Feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B5DB10_1px,transparent_1px),linear-gradient(to_bottom,#10B5DB10_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0F14] via-transparent to-[#10B5DB]/10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#10B5DB] font-bold tracking-[0.4em] text-xs uppercase mb-4 block">Tech Ecosystem</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            DRIVING <span className="text-[#10B5DB]">DIGITAL</span> POWER
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#10B5DB] to-transparent mx-auto" />
        </motion.div>

        {/* Services Grid with Custom Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              {/* Card Glow Effect on Hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B5DB] to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition duration-500"></div>
              
              <div className="relative flex flex-col items-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-full transition-all duration-300 group-hover:bg-white/10">
                
                {/* Rotating Border Detail (Optional Visual) */}
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B5DB] animate-pulse shadow-[0_0_10px_#10B5DB]"></div>

                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#10B5DB]/50 group-hover:scale-110 transition-all duration-500">
                  <div className="text-3xl text-[#10B5DB] group-hover:drop-shadow-[0_0_8px_#10B5DB]">
                    {service.icon}
                  </div>
                </div>

                <h3 className="text-white font-bold text-sm md:text-base text-center uppercase tracking-wider group-hover:text-[#10B5DB] transition-colors">
                  {service.name}
                </h3>

                {/* Subtle Bottom Bar */}
                <div className="mt-4 w-6 h-0.5 bg-white/20 group-hover:w-12 group-hover:bg-[#10B5DB] transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Particles/Elements */}
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#10B5DB]/20 rounded-full blur-[80px]"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px]"></div>
    </section>
  );
}