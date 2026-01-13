"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Home, User, Briefcase, FolderOpen, Users, Phone, Mail, Linkedin, Facebook, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "#about", label: "About", icon: User },
    { href: "#services", label: "Services", icon: Briefcase },
    { href: "#portfolio", label: "Portfolio", icon: FolderOpen },
    { href: "#team", label: "Team", icon: Users },
    { href: "#contact", label: "Contact", icon: Phone },
  ];

  const handleNavigation = (href) => {
    if (href === "/") {
      // Home link: always navigate to home
      router.push("/");
    } else if (pathname === "/" && href.startsWith("#")) {
      // On home page, smooth scroll to section
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
    } else if (href.startsWith("#")) {
      // Not on home page, navigate to home first, then scroll to section
      router.push("/");
      // Use a timeout to wait for navigation and page load
      setTimeout(() => {
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
      }, 200); // Increased delay to ensure page is loaded
    } else {
      // Direct route navigation
      router.push(href);
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
          onClick={() => router.push("/")}
          className="flex items-center gap-4 cursor-pointer group"
        >
          {/* Increased Logo Size */}
          <div className="relative w-20 h-20 md:w-20 md:h-20 ml-4">
             <Image
              src={isScrolled ? "/images/GCLogo.png" : "/gclogowhite.png"}
              alt="globium clouds logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        
       
         
      
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavigation(link.href)}
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
              onClick={() => handleNavigation("#contact")}
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

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[99999] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ left: "-320px" }}
              animate={{ left: 0 }}
              exit={{ left: "-320px" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl z-[100000] md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-900 hover:text-[#10B5DB] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div className="mb-8 pt-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/images/GCLogo.png"
                      alt="globium clouds logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-4 mb-8">
                  {navLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <motion.button
                        key={link.href}
                        onClick={() => handleNavigation(link.href)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-4 text-left text-lg font-semibold text-gray-900 hover:text-[#10B5DB] transition-colors duration-200 p-3 rounded-lg hover:bg-blue-50 group"
                      >
                        <IconComponent className="w-6 h-6 text-[#10B5DB] group-hover:scale-110 transition-transform duration-200" />
                        <span className="tracking-tight">{link.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1, duration: 0.3 }}
                  className="space-y-4 mb-8 pt-4 border-t border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#10B5DB]" />
                    <a href="mailto:globiumclouds@gmail.com" className="text-sm text-gray-900 font-semibold hover:text-[#10B5DB] transition-colors break-all">
                      globiumclouds@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#10B5DB]" />
                    <a href="tel:+923352778488" className="text-sm text-gray-900 font-semibold hover:text-[#10B5DB] transition-colors">
                      +92 335 2778488
                    </a>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    {[
                      { icon: Linkedin, href: "https://www.linkedin.com/company/globiumclouds/" },
                      { icon: Facebook, href: "https://www.facebook.com/globiumclouds/" },
                      { icon: Instagram, href: "https://www.instagram.com/explore/locations/202412828462806/globium-clouds/" }
                    ].map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        target="_blank"
                        whileHover={{ y: -3, backgroundColor: "#10B5DB", color: "#ffffff" }}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-blue-100 text-[#10B5DB] transition-all shadow-sm"
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 2) * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleNavigation("#contact")}
                    className="w-full bg-[#10B5DB] hover:bg-[#0aa0c2] py-6 text-white font-black uppercase tracking-widest rounded-2xl text-lg shadow-xl shadow-blue-200 transition-all duration-200"
                  >
                    Get a Quote
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

