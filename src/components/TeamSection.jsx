"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { teamService } from "../services/teamService";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const TeamMember = ({ name, role, profileImage, linkedin, github }) => {
  return (
    <div className="group h-full flex flex-col pb-10 select-none">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg transition-all duration-500 group-hover:shadow-2xl">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={name}
            fill
            className="object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase text-xs">
            No Image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:bg-[#10B5DB] hover:text-white transition-all shadow-md">
              <FaLinkedinIn size={18} />
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-all shadow-md">
              <FaGithub size={18} />
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-xl font-black text-gray-900 group-hover:text-[#10B5DB] transition-colors uppercase tracking-tighter">
          {name}
        </h3>
        <p className="text-xs font-bold text-[#10B5DB] mt-1 uppercase tracking-[0.2em]">
          {role}
        </p>
      </div>
    </div>
  );
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamService.getTeams({ isActive: true, limit: 100 });
        let members = response.data || [];

        const fIndex = members.findIndex(m => 
          m.position?.toLowerCase().includes("founder") || 
          m.position?.toLowerCase().includes("ceo")
        );

        if (fIndex > -1) {
          const founder = members.splice(fIndex, 1)[0];
          members.unshift(founder);
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
    <section className="py-24 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-full mx-auto px-4 relative">
      <div className="text-center mb-16">
  <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase">
    OUR <span className="text-[#10B5DB]">EXPERTS.</span>
  </h2>
  {/* Line ki jagah text */}
  <p className="text-gray-400 mt-4 font-bold text-xs uppercase tracking-[0.4em]">
    The brains behind the innovation
  </p>
</div>

        {loading ? (
          <div className="h-[450px] flex items-center justify-center">
            <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B5DB] w-1/2 animate-[loading_1s_infinite]" />
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay, EffectCoverflow]}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true} // ✅ Founder ab hamesha center mein aayega
            loop={teamMembers.length > 3} // ✅ Loop zaroori hai center alignment ke liye
            slidesPerView={"auto"} // ✅ CSS width ke saath kaam karega
            initialSlide={0}
            speed={800}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            coverflowEffect={{
              rotate: 5,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="team-swiper !pb-20"
          >
            {teamMembers.map((member) => (
              <SwiperSlide 
                key={member._id} 
                className="!w-[280px] md:!w-[350px]" // ✅ Fix width for centering
              >
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
        }
        .swiper-slide {
          transition: all 0.6s ease-in-out;
          opacity: 0.9;
          transform: scale(0.85);
          filter: grayscale(100%); /* Side slides grayscale rahengi focus ke liye */
        }
        .swiper-slide-active {
          opacity: 1 !important;
          transform: scale(1.1) !important;
          filter: grayscale(0%) !important; /* Center wali slide full color */
          z-index: 10;
        }
        .swiper-pagination-bullet-active {
          background: #10B5DB !important;
          width: 35px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </section>
  );
}








// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { teamService } from "../services/teamService";
// import { FaLinkedinIn, FaGithub } from "react-icons/fa";

// // Swiper Imports
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

// // Swiper Styles
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/effect-coverflow";

// const TeamMember = ({ name, role, profileImage, linkedin, github }) => {
//   return (
//     <div className="group h-full flex flex-col pb-10 select-none">
//       <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg transition-all duration-500 group-hover:shadow-2xl">
//         {profileImage ? (
//           <Image
//             src={profileImage}
//             alt={name}
//             fill
//             className="object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-110"
//           />
//         ) : (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase text-xs">
//             No Image
//           </div>
//         )}

//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//         <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
//           {linkedin && (
//             <a href={linkedin} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:bg-[#10B5DB] hover:text-white transition-all shadow-md">
//               <FaLinkedinIn size={18} />
//             </a>
//           )}
//           {github && (
//             <a href={github} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-all shadow-md">
//               <FaGithub size={18} />
//             </a>
//           )}
//         </div>
//       </div>

//       <div className="mt-6 text-center">
//         <h3 className="text-xl font-black text-gray-900 group-hover:text-[#10B5DB] transition-colors uppercase tracking-tighter">
//           {name}
//         </h3>
//         <p className="text-xs font-bold text-[#10B5DB] mt-1 uppercase tracking-[0.2em]">
//           {role}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default function TeamSection() {
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [founderIndex, setFounderIndex] = useState(0);

//   useEffect(() => {
//     const fetchTeamMembers = async () => {
//       try {
//         const response = await teamService.getTeams({ isActive: true, limit: 100 });
//         const members = response.data || [];

//         // ✅ Step 1: Array ko disturb kiye baghair Founder ka Index dhoondo
//         const fIndex = members.findIndex(m => 
//           m.position?.toLowerCase().includes("founder") || 
//           m.position?.toLowerCase().includes("ceo")
//         );

//         setTeamMembers(members);
        
//         // ✅ Step 2: Agar founder mil jaye to uska index save karlo
//         if (fIndex > -1) {
//           setFounderIndex(fIndex);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTeamMembers();
//   }, []);

//   return (
//     <section className="py-24 bg-[#F8FAFC] overflow-hidden">
//       <div className="max-w-full mx-auto px-4 relative">
//         <div className="text-center mb-16">
//           <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase">
//             OUR <span className="text-[#10B5DB]">EXPERTS.</span>
//           </h2>
//           <div className="w-20 h-1.5 bg-[#10B5DB] mx-auto mt-4 rounded-full" />
//         </div>

//         {loading ? (
//           <div className="h-[450px] flex items-center justify-center">
//             <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
//               <div className="h-full bg-[#10B5DB] w-1/2 animate-[loading_1s_infinite]" />
//             </div>
//           </div>
//         ) : (
//           <Swiper
//             // ✅ Key prop is used to re-mount Swiper once we have the correct founderIndex
//             key={founderIndex}
//             modules={[Pagination, Autoplay, EffectCoverflow]}
//             effect={"coverflow"}
//             grabCursor={true}
//             centeredSlides={true}
//             loop={teamMembers.length > 3}
//             slidesPerView={"auto"}
//             initialSlide={founderIndex} // ✅ Slider hamesha Founder index se start hoga
//             speed={800}
//             autoplay={{
//               delay: 3000,
//               disableOnInteraction: false,
//               pauseOnMouseEnter: true,
//             }}
//             coverflowEffect={{
//               rotate: 0, // No rotation for a cleaner premium look
//               stretch: 0,
//               depth: 100,
//               modifier: 2.5,
//               slideShadows: false,
//             }}
//             pagination={{ clickable: true, dynamicBullets: true }}
//             className="team-swiper !pb-20"
//           >
//             {teamMembers.map((member) => (
//               <SwiperSlide 
//                 key={member._id} 
//                 className="!w-[280px] md:!w-[350px]"
//               >
//                 <TeamMember
//                   name={member.name}
//                   role={member.position}
//                   profileImage={member.profileImage}
//                   linkedin={member.linkedin}
//                   github={member.github}
//                 />
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         )}
//       </div>

//       <style jsx global>{`
//         .team-swiper {
//           overflow: visible !important;
//         }
//         .swiper-slide {
//           transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
//           opacity: 0.9; /* Non-active slides dim rahengi */
//           transform: scale(0.85);
//           filter: blur(1px); /* Slight blur for focus depth */
//         }
//         .swiper-slide-active {
//           opacity: 1 !important;
//           transform: scale(1.1) !important;
//           filter: blur(0px) !important;
//           z-index: 10;
//         }
//         .swiper-pagination-bullet-active {
//           background: #10B5DB !important;
//           width: 35px !important;
//           border-radius: 5px !important;
//         }
//       `}</style>
//     </section>
//   );
// }