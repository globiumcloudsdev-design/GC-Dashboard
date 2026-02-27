"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { teamService } from "../services/teamService";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { sectionReveal } from "@/lib/animations";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Pagination,
  Autoplay,
  EffectCoverflow,
  Navigation,
} from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

const TeamSkeleton = () => (
  <div className="group relative py-8 px-2 md:py-12 md:px-4 w-full">
    <div className="relative z-10 overflow-hidden bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl h-[380px] md:h-[480px] animate-pulse">
      <div className="absolute inset-0 bg-gray-100" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="h-6 bg-gray-200 rounded-full w-24 mb-4" />
        <div className="h-10 bg-gray-200 rounded-lg w-2/3 mb-4" />
        <div className="h-1 bg-gray-200 rounded-full w-16" />
      </div>
    </div>
  </div>
);

const TeamMember = ({ name, role, profileImage, linkedin, github, index }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative py-8 px-2 md:py-12 md:px-4"
    >
      {/* Premium Glow Effect */}
      <div className="absolute inset-x-8 md:inset-x-12 top-20 md:top-24 bottom-20 md:bottom-24 bg-linear-to-tr from-[#10B5DB]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-[100px] -z-10" />

      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 overflow-hidden bg-[#F1F5F9] border border-white/50 rounded-[3rem] md:rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 h-[400px] md:h-[520px] flex flex-col group-hover:shadow-[0_40px_80px_-20px_rgba(16,181,219,0.25)]"
      >
        {/* Brand Logo - No Background */}
        <div className="absolute top-8 left-8 z-30 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500">
          <Image
            src="/images/GCLogo.png"
            alt="GC Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Image Container with Parallax-like effect */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {profileImage ? (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
              className="relative w-full h-full"
            >
              <Image
                src={profileImage}
                alt={name}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-opacity duration-700"
              />
              {/* Complex Multi-layered Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F14] via-[#0A0F14]/40 to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#10B5DB]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-linear-to-br from-[#1b252d] to-[#0A0F14] flex items-center justify-center">
              <span className="text-white text-9xl font-black opacity-5 transform -rotate-12 select-none">
                {initials}
              </span>
              <div className="absolute w-24 h-24 rounded-full bg-linear-to-tr from-[#10B5DB] to-[#0A8CA5] flex items-center justify-center shadow-2xl">
                <span className="text-white text-4xl font-black">
                  {initials}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Area - Minimalist & Sleek */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            {/* Glassy Role Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B5DB]" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {role}
              </p>
            </div>

            <h3 className="text-3xl md:text-4xl font-black leading-tight text-white mb-2 tracking-tight">
              {name.split(" ")[0]} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10B5DB] to-[#0A8CA5]">
                {name.split(" ").slice(1).join(" ")}
              </span>
            </h3>

            <motion.div
              className="w-12 h-1 bg-linear-to-r from-[#10B5DB] to-transparent rounded-full"
              whileInView={{ width: 48 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        </div>

        {/* Floating Social Icons - Moved to Right to avoid overlap */}
        <div className="absolute top-8 right-8 flex flex-col gap-3 group-hover:opacity-100 transition-all duration-500 z-30">
          {linkedin && (
            <motion.a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.1, backgroundColor: "#10B5DB" }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
            >
              <FaLinkedinIn size={18} />
            </motion.a>
          )}
          {github && (
            <motion.a
              href={github}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.1, backgroundColor: "#000" }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
            >
              <FaGithub size={18} />
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null); // Define sectionRef

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamService.getTeams({ isActive: true, limit: 100 });
        let members = response.data || [];

        const ceoIndex = members.findIndex((m) =>
          m.position?.toLowerCase().includes("ceo"),
        );

        if (ceoIndex > -1) {
          const ceo = members.splice(ceoIndex, 1)[0];
          members.unshift(ceo);
        }

        setTeamMembers(members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#F8FAFC] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Background Decorative Text */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 overflow-hidden">
          <h2 className="text-[15vw] font-black text-gray-200/20 leading-none uppercase tracking-tighter">
            Experts
          </h2>
        </div>

        {/* Floating Decorative Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#10B5DB]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#0A8CA5]/5 rounded-full blur-[80px] animate-pulse delay-700" />

        <motion.div
          {...sectionReveal}
          className="text-center mb-16 md:mb-20 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B5DB]/5 border border-[#10B5DB]/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B5DB] animate-pulse" />
            <span className="text-[#10B5DB] font-black tracking-[0.3em] text-[10px] md:text-xs uppercase">
              The Collective Intelligence
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-none">
            OUR{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10B5DB] to-[#0A8CA5]">
              EXPERTS
            </span>
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-1.5 bg-[#10B5DB] rounded-full" />
            <div className="w-4 h-1.5 bg-[#10B5DB]/30 rounded-full ml-2" />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-6 pb-20">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full md:w-[calc(33.333%-1.5rem)] max-w-[420px]"
              >
                <TeamSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative px-4 md:px-12">
            <Swiper
              modules={[Pagination, Autoplay, EffectCoverflow, Navigation]}
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              initialSlide={initialSlide}
              loop={teamMembers.length > 2}
              slidesPerView={"auto"}
              speed={600} // Slightly faster transition speed
              coverflowEffect={{
                rotate: 5,
                stretch: 0,
                depth: 100,
                modifier: 2.5,
                slideShadows: false,
              }}
              autoplay={{
                delay: 2000, // Faster loop as requested
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: ".team-prev",
                nextEl: ".team-next",
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              breakpoints={{
                320: { slidesPerView: 1.1 },
                480: { slidesPerView: 1.3 },
                640: { slidesPerView: 1.5 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="team-swiper pb-20!"
            >
              {teamMembers.map((member, index) => (
                <SwiperSlide key={member._id} className="max-w-[420px]">
                  <TeamMember
                    index={index}
                    name={member.name}
                    role={member.position}
                    profileImage={member.profileImage}
                    linkedin={member.linkedin}
                    github={member.github}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-12 left-0 right-0 flex justify-between items-center z-20 pointer-events-none">
              <button className="team-prev pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-800 hover:bg-[#10B5DB] hover:text-white transition-all duration-300 -translate-x-2 md:-translate-x-6 border border-gray-100 group">
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button className="team-next pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-800 hover:bg-[#10B5DB] hover:text-white transition-all duration-300 translate-x-2 md:translate-x-6 border border-gray-100 group">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .team-swiper {
          overflow: visible !important;
        }

        .swiper-pagination-bullet {
          background: #cbd5e1 !important;
          opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
          background: #10b5db !important;
          width: 35px !important;
          border-radius: 12px !important;
        }

        .swiper-slide {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(0.85); /* Slightly smaller for better contrast */
          opacity: 0.4;
        }

        .swiper-slide-active {
          transform: scale(1.05);
          opacity: 1;
          z-index: 20;
        }

        .swiper-slide img {
          border-radius: inherit;
        }
      `}</style>
    </section>
  );
}






