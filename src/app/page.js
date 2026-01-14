"use client";

import dynamic from "next/dynamic";

// Static imports for above-the-fold components
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TechnologyStack from "@/components/TechnologyStack";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

// Dynamic imports for below-the-fold heavy components
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection"), {
  loading: () => <div className="py-28 bg-[#0A0F14] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-[#10B5DB]/20 border-t-[#10B5DB] rounded-full animate-spin" />
  </div>
});

const TeamSection = dynamic(() => import("@/components/TeamSection"), {
  loading: () => <div className="py-28 bg-[#F8FAFC] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-[#10B5DB]/20 border-t-[#10B5DB] rounded-full animate-spin" />
  </div>
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section id="home">
        <HeroSection />
      </section>
      <ServicesSection />
      <TechnologyStack />
      <TrustSection />
      <PortfolioSection />
      <TeamSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

