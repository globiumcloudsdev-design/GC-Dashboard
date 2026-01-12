"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { teamService } from "../services/teamService";
import { sectionReveal } from "@/lib/animations";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const TeamMember = ({ name, role, profileImage, linkedin, github }) => {
  const initials = name.split(" ").map(n => n[0]).join("");

  return (
    <div className="group relative py-8 px-2 md:py-12 md:px-4">
      <div className="absolute inset-x-4 md:inset-x-10 top-16 md:top-20 bottom-16 md:bottom-20 bg-[#10B5DB]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />

      <div className="relative z-10 overflow-hidden bg-white border border-gray-100 rounded-[2rem] md:rounded-[3rem] shadow-xl transition-all duration-500 h-[350px] md:h-[450px]">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#10B5DB] to-[#0a8ca5] flex items-center justify-center">
            <span className="text-white text-4xl md:text-6xl font-black">
              {initials}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:via-transparent" />

        <div className="absolute bottom-12 md:bottom-16 left-0 right-0 p-4 md:p-8 text-white">
          <h3 className="text-xl md:text-2xl font-black leading-tight group-hover:text-[#10B5DB] transition-colors duration-300">
            {name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-200 mt-2">
            {role}
          </p>
        </div>

        {(linkedin || github) && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[80%] md:w-[70%] bg-white/20 backdrop-blur-xl border border-white/30 py-2 md:py-3 px-4 md:px-6 rounded-xl md:rounded-2xl flex justify-center gap-4 md:gap-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-[#10B5DB] transition-all scale-110"
              >
                <FaLinkedinIn size={20} />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-black transition-all scale-110"
              >
                <FaGithub size={20} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialSlide, setInitialSlide] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamService.getTeams({
          isActive: true,
          limit: 100,
        });
        let members = response.data || [];

        const ceoIndex = members.findIndex(m =>
          m.position?.toLowerCase().includes("ceo")
        );

        let initialSlideIndex = 0;
        if (ceoIndex !== -1) {
          const ceo = members.splice(ceoIndex, 1)[0];
          const middle = Math.floor(members.length / 2);
          members.splice(middle, 0, ceo);
          initialSlideIndex = middle;
        }

        setTeamMembers(members);
        setInitialSlide(initialSlideIndex);
      } catch (err) {
        console.error("Error fetching team:", err);
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
        <motion.div {...sectionReveal} className="text-center mb-8 md:mb-10">
          <span className="text-[#10B5DB] font-bold tracking-[0.3em] text-xs uppercase">
            The Collective Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-gray-900 mt-4 mb-4">
            OUR <span className="text-[#10B5DB]">EXPERTS</span>
          </h2>
          <div className="w-16 md:w-24 h-2 bg-[#10B5DB] mx-auto rounded-full" />
        </motion.div>

        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-gray-400 animate-pulse font-bold tracking-widest text-xl">
              LOADING TEAM...
            </p>
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay, EffectCoverflow]}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            initialSlide={initialSlide}
            loop={teamMembers.length > 2}
            slidesPerView={"auto"}
            speed={500}               // ✅ FAST (ONLY CHANGE)
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            autoplay={{
              delay: 1800,           // ✅ FAST (ONLY CHANGE)
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              320: { slidesPerView: 1.1 },
              480: { slidesPerView: 1.3 },
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="team-swiper !pb-20"
          >
            {teamMembers.map(member => (
              <SwiperSlide key={member._id} className="max-w-[420px]">
                <TeamMember
                  name={member.name}
                  role={member.position}
                  profileImage={member.profileImage}
                  linkedin={member.linkedin}
                  github={member.github}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <style jsx global>{`
        .team-swiper {
          overflow: visible !important;
          padding-top: 20px;
        }

        .swiper-pagination-bullet-active {
          background: #10B5DB !important;
          width: 35px !important;
          border-radius: 12px !important;
        }

        .swiper-slide {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(0.9);
          opacity: 1;
        }

        .swiper-slide-active {
          transform: scale(1.05);
          z-index: 20;
        }

        .swiper-slide img {
          border-radius: inherit;
        }
      `}</style>
    </section>
  );
}
