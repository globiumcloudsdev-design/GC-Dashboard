"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#team", label: "Team" },
    { href: "#contact", label: "Contact" },
  ];

  const handleSmoothScroll = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-blue-50 py-2" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo Section */}
        <motion.div 
          onClick={() => handleSmoothScroll("#home")}
          className="flex items-center gap-4 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          {/* Increased Logo Size */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 transition-transform duration-700 group-hover:rotate-[360deg]">
             <Image
              src="/images/GCLogo.png"
              alt="globium clouds logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            {/* Lowercase & Blue Color Branding */}
            <span className="text-xl md:text-2xl font-black tracking-tighter text-[#10B5DB] ">
              Globium Clouds
            </span>
          
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleSmoothScroll(link.href)}
              className="relative text-[13px] font-bold text-gray-500 hover:text-[#10B5DB] transition-colors uppercase tracking-[0.15em] group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B5DB] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* CTA Section */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleSmoothScroll("#contact")}
              className="hidden md:flex bg-[#10B5DB] hover:bg-[#0aa0c2] text-white font-black text-xs uppercase tracking-widest px-8 py-6 rounded-2xl shadow-lg shadow-blue-400/20 transition-all"
            >
              Get a Quote
            </Button>
          </motion.div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-8 h-8 text-[#10B5DB]" /> : <Menu className="w-8 h-8 text-[#10B5DB]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-blue-50 p-8 md:hidden"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleSmoothScroll(link.href)}
                  className="text-left text-2xl font-black text-gray-900 lowercase tracking-tighter hover:text-[#10B5DB]"
                >
                  {link.label}
                </button>
              ))}
              <Button
                onClick={() => handleSmoothScroll("#contact")}
                className="w-full bg-[#10B5DB] py-8 text-white font-black uppercase tracking-widest rounded-2xl text-lg shadow-xl shadow-blue-200"
              >
                Get a Quote
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}