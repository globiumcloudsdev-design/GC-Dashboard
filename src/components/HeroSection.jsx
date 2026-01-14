"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { magneticHover } from "@/lib/animations";
import { join } from "path";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const trustPoints = [
    { icon: Shield, text: "Enterprise-grade security" },
    { icon: Clock, text: "99.9% uptime guarantee" },
    { icon: Award, text: "Award-winning solutions" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0F14]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105" 
          style={{ backgroundImage: 'url(/images/bg.png)' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#10B5DB]/10" />
        
        {/* Animated Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040%20L40%2040%20L40%200%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff10%22%20stroke-width%3D%220.5%22/%3E%3C/svg%3E')] opacity-30"></div>
      </div>

      {/* Floating Light Orb */}
      <div className="absolute top-1/4 -right-10 sm:-right-20 w-96 h-96 bg-[#10B5DB]/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl pb-32"
        >
          {/* Trust Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <Sparkles className="h-4 w-4 text-[#10B5DB]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Trusted by 500+ global brands
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight mb-8"
          >
            LIMITLESS <br />
            <span className="relative inline-block mt-2">
              CLOUD
              <span className="absolute z-10 mx-3  px-4 sm:px-6 py-1  bg-gradient-to-r from-[#10B5DB] to-[#0a7a9a] rounded-2xl  italic">
                INNOVATION
              </span>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-10"
          >
            Empower your team with cutting-edge cloud technology, seamless integrations, 
            and scalable solutions that drive <strong>innovation and growth</strong>.
          </motion.p>

          {/* CTA Group */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-5 mb-8">
            <motion.div {...magneticHover}>
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base md:h-14 md:px-10 md:text-lg font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(16,181,219,0.5)] transition-all duration-300 bg-[#10B5DB] hover:bg-[#0a7a9a] text-white"
              >
                <Link href="#contact" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div {...magneticHover}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base md:h-14 md:px-10 md:text-lg font-bold rounded-xl border-2 border-white/20 bg-transparent hover:bg-white/5 text-white transition-all duration-300"
              >
                <Link href="#technology-stack">View Services</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Points Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10"
          >
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#10B5DB]/10">
                  <point.icon className="h-5 w-5 text-[#10B5DB]" />
                </div>
                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider leading-tight">
                  {point.text}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Wave with matching Theme Color */}
      <div className="absolute bottom-0 left-0 right-0 leading-[0] overflow-hidden">
        <svg viewBox="0 0 1440 120" className="w-full h-auto relative -bottom-1">
          <path
            fill="#F8FAFC" /* This matches the TeamSection background color */
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,64L1440,75L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}