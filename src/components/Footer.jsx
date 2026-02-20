"use client";
import Image from "next/image";
import { useState } from "react";
import {
  Linkedin,
  Facebook,
  Instagram,
  Phone,
  Mail,
  Send,
  ArrowRight,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      toast.success("Successfully subscribed!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Process", href: "#process" },
      { name: "Expert Team", href: "#team" },
      { name: "Contact", href: "#contact" },
    ],
    services: [
      { name: "Web Systems", href: "#services" },
      { name: "Mobile Apps", href: "#services" },
      { name: "Cloud Solutions", href: "#services" },
      { name: "AI/ML Dev", href: "#services" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-[#0A0F14] text-white pt-32 pb-12 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#10B5DB]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex flex-col gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/images/GCLogo.png"
                  alt="Globium Clouds"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  Globium <span className="text-[#10B5DB]">Clouds</span>
                </h3>
                <p className="text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase">
                  Limitless Innovation
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm font-medium">
              We engineer scalable software solutions that empower businesses to
              lead in the digital era. From cloud to AI, we build the future.
            </p>
            <div className="flex items-center gap-4">
              {[Linkedin, Facebook, Instagram].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{
                    y: -5,
                    scale: 1.1,
                    backgroundColor: "#10B5DB",
                    borderColor: "#10B5DB",
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 transition-colors group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#10B5DB]">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 group text-sm font-bold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#10B5DB] transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#10B5DB]">
              Services
            </h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 group text-sm font-bold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#10B5DB] transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Newsletter */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#10B5DB]">
                Stay Updated
              </h4>
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  placeholder="Enter your corporate email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:ring-1 focus:ring-[#10B5DB] outline-none transition-all placeholder:text-gray-600"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#10B5DB] hover:bg-[#0aa0c2] text-white px-6 rounded-xl transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">
                  Global Ops
                </h5>
                <p className="text-sm font-bold text-white">+92 335 2778488</p>
              </div>
              <div>
                <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">
                  Email Us
                </h5>
                <p className="text-sm font-bold text-white break-all">
                  support@globiumclouds.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[Zap, Shield, Globe].map((Icon, i) => (
                <Icon key={i} className="w-4 h-4 text-[#10B5DB]/40" />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              © {currentYear} Globium Clouds. High-performance software
              engineering.
            </p>
          </div>

          <div className="flex gap-8">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#10B5DB] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
