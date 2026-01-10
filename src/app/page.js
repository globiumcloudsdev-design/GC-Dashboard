"use client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TechnologyStack from "@/components/TechnologyStack";
import TrustSection from "@/components/TrustSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

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
