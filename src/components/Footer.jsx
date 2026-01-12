"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Linkedin, Facebook, Instagram, Home, Briefcase,
  FolderOpen, Users, Phone, User, Mail, Send, LogIn
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F8FAFC] text-gray-900 pt-20 border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Column 1: Branding */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className=" p-1.5 rounded-xl shadow-sm border border-blue-50">
                <Image src="/images/GCLogo.png" alt="Globium Clouds" width={60} height={60} className="rounded-lg" />
              </div>
              
            </div>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-medium">
              Building reliable cloud and dashboard solutions. Manage users, bookings, and attendance — all in one place.
            </p>
            <div className="flex items-center gap-3">
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
          </div>

          {/* Column 2: Navigator */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#10B5DB]">Navigator</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", icon: Home, href: "#home" },
                { name: "Services", icon: Briefcase, href: "#services" },
                { name: "Portfolio", icon: FolderOpen, href: "#portfolio" },
                { name: "Our Team", icon: Users, href: "#team" },
                { name: "Agent Portal", icon: User, href: "/agent/login" },
                { name: "Login", icon: LogIn, href: "/login" }
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="group flex items-center gap-2 text-gray-600 hover:text-[#10B5DB] transition-colors">
                    <span className="text-sm font-bold">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#10B5DB]">Connect</h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Phone</p>
                <a href="tel:+923352778488" className="text-gray-900 font-bold hover:text-[#10B5DB] transition-colors">+92 335 2778488</a>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Email</p>
                <a href="mailto:globiumclouds@gmail.com" className="text-gray-900 font-bold hover:text-[#10B5DB] transition-colors break-all">globiumclouds@gmail.com</a>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Office</p>
                <a href="https://www.google.com/maps/search/?api=1&query=Buffer+Zone,+Sector+15-A/4,+Karachi" target="_blank" className="text-gray-600 font-medium leading-snug hover:text-[#10B5DB] transition-colors">Buffer Zone, Sector 15-A/4, Karachi</a>
              </div>
            </div>
          </div>

          {/* Column 4: Subscribe */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#10B5DB]">Newsletter</h4>
            <p className="text-sm text-gray-500 font-medium">Stay updated with cloud trends.</p>
            <div className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#10B5DB] outline-none transition-all shadow-sm"
              />
              <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Subscribe <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            © {currentYear} <span className="text-gray-900">Globium Clouds</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="/privacy-policy" className="hover:text-[#10B5DB]">Privacy Policy</a>
            <a href="#" className="hover:text-[#10B5DB]">Terms</a>
         
          </div>
        </div>
      </div>
    </footer>
  );
}