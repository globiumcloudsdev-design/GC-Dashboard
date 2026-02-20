"use client";

import dynamic from "next/dynamic";

// Static imports for above-the-fold components
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TechnologyStack from "@/components/TechnologyStack";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import BlogSection from "@/components/BlogSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";

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
      <BlogSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

