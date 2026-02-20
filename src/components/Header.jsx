"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Code,
  Smartphone,
  Cloud,
  Cpu,
  Palette,
  ShieldCheck,
  Rocket,
  Layout,
  Globe,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const DropdownItem = ({ icon: Icon, title, description, onClick }) => (
  <motion.div
    whileHover={{ x: 5, backgroundColor: "rgba(16, 181, 219, 0.05)" }}
    className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300"
    onClick={onClick}
  >
    <div className="p-2 rounded-lg bg-[#10B5DB]/10 text-[#10B5DB]">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#10B5DB]">
        {title}
      </h4>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    {
      title: "Web Development",
      icon: Code,
      description: "Modern, scalable web apps built with Next.js & React.",
    },
    {
      title: "Mobile Apps",
      icon: Smartphone,
      description: "Cross-platform iOS & Android solutions.",
    },
    {
      title: "Cloud Solutions",
      icon: Cloud,
      description: "Scalable infrastructure and cloud migrations.",
    },
    {
      title: "AI & ML",
      icon: Cpu,
      description: "Smart automation and predictive analytics.",
    },
    {
      title: "UI/UX Design",
      icon: Palette,
      description: "User-centric designs that drive engagement.",
    },
    {
      title: "Cybersecurity",
      icon: ShieldCheck,
      description: "Protecting your digital assets & data.",
    },
  ];

  const portfolioCategories = [
    {
      title: "SaaS Platforms",
      icon: Zap,
      description: "Highly functional software as a service.",
    },
    {
      title: "E-commerce",
      icon: Globe,
      description: "Scalable online stores & marketplaces.",
    },
    {
      title: "Corporate Works",
      icon: Layout,
      description: "Professional business web experiences.",
    },
    {
      title: "Custom Solutions",
      icon: Rocket,
      description: "Bespoke projects tailored to your needs.",
    },
  ];

  const handleNavigation = (href) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        const offset = isScrolled ? 70 : 100;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      } else if (pathname !== "/") {
        router.push("/" + href);
      }
    } else {
      router.push(href);
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? "py-3 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border-b border-white/20"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Section */}
        <motion.div
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          <div
            className={`relative transition-all duration-500 ${isScrolled ? "w-12 h-12" : "w-16 h-16"}`}
          >
            <Image
              src={isScrolled ? "/images/GCLogo.png" : "/GCLogowhite.png"}
              alt="Globium Clouds Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-xl font-black tracking-tighter transition-colors duration-500 ${isScrolled ? "text-[#0A0F14]" : "text-white"}`}
            >
              GLOBIUM <span className="text-[#10B5DB]">CLOUDS</span>
            </span>
            <span
              className={`text-[8px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 ${isScrolled ? "text-gray-400" : "text-gray-300"}`}
            >
              Limitless Innovation
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => handleNavigation("/")}
            className={`px-4 py-2 text-[13px] font-bold transition-all uppercase tracking-wider relative group ${isScrolled ? "text-gray-600" : "text-gray-200"}`}
          >
            Home
            <span
              className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#10B5DB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${pathname === "/" ? "scale-x-100" : ""}`}
            />
          </button>

          {/* Services Dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setActiveDropdown("services")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`flex items-center gap-1 px-4 py-2 text-[13px] font-bold transition-all uppercase tracking-wider ${isScrolled ? "text-gray-600" : "text-gray-200"}`}
            >
              Services{" "}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === "services" ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {activeDropdown === "services" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] border border-gray-100 p-6 overflow-hidden mt-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((item, idx) => (
                      <DropdownItem
                        key={idx}
                        {...item}
                        onClick={() => handleNavigation("#services")}
                      />
                    ))}
                  </div>
                  <div
                    className="mt-6 p-4 bg-gray-50 rounded-2xl flex items-center justify-between group/cta cursor-pointer"
                    onClick={() => handleNavigation("#services")}
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Explore all services
                    </p>
                    <ArrowRight className="w-4 h-4 text-[#10B5DB] group-hover/cta:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Portfolio Dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setActiveDropdown("portfolio")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`flex items-center gap-1 px-4 py-2 text-[13px] font-bold transition-all uppercase tracking-wider ${isScrolled ? "text-gray-600" : "text-gray-200"}`}
            >
              Portfolio{" "}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === "portfolio" ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {activeDropdown === "portfolio" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[400px] bg-white rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] border border-gray-100 p-6 overflow-hidden mt-2"
                >
                  <div className="flex flex-col gap-2">
                    {portfolioCategories.map((item, idx) => (
                      <DropdownItem
                        key={idx}
                        {...item}
                        onClick={() => handleNavigation("#portfolio")}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {["Team", "Contact"].map((item) => (
            <button
              key={item}
              onClick={() => handleNavigation(`#${item.toLowerCase()}`)}
              className={`px-4 py-2 text-[13px] font-bold transition-all uppercase tracking-wider relative group ${isScrolled ? "text-gray-600" : "text-gray-200"}`}
            >
              {item}
              <span className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-[#10B5DB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          ))}

          <button
            onClick={() => router.push("/blogs")}
            className={`px-4 py-2 text-[13px] font-bold transition-all uppercase tracking-wider relative group ${isScrolled ? "text-gray-600" : "text-gray-200"}`}
          >
            Insights
            <span className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-[#10B5DB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
        </nav>

        {/* CTA Section */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:block relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#10B5DB] to-[#0A8CA5] rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
            <Button
              onClick={() => handleNavigation("#contact")}
              className="relative bg-gradient-to-r from-[#10B5DB] to-[#0A8CA5] hover:from-[#0A8CA5] hover:to-[#10B5DB] text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-6 rounded-2xl shadow-xl transition-all border-none"
            >
              Get a Quote
            </Button>
          </motion.div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? "text-gray-900 bg-gray-100" : "text-white bg-white/10"}`}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0A0F14]/60 backdrop-blur-md z-[999]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[1000] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/GCLogo.png"
                    alt="logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-auto">
                {[
                  "Home",
                  "Services",
                  "Portfolio",
                  "Team",
                  "Blog",
                  "Contact",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      handleNavigation(
                        item === "Home"
                          ? "/"
                          : item === "Blog"
                            ? "/blogs"
                            : `#${item.toLowerCase()}`,
                      )
                    }
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 text-xl font-black text-[#0A0F14] group"
                  >
                    {item}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">
                  Connect with us
                </p>
                <div className="flex gap-4">
                  {[Linkedin, Facebook, Instagram].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ y: -5, color: "#10B5DB" }}
                      className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shadow-sm"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
