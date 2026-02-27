"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Target, Users, Award, TrendingUp } from "lucide-react";
import { contentStagger, depthFade } from "@/lib/animations";

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [counters, setCounters] = useState({
    clients: 0,
    projects: 0,
    uptime: 0,
    support: 0,
  });

  const stats = [
    {
      icon: Users,
      number: 500,
      suffix: "+",
      label: "Happy Clients",
      key: "clients",
    },
    {
      icon: Award,
      number: 50,
      suffix: "+",
      label: "Projects Completed",
      key: "projects",
    },
    {
      icon: TrendingUp,
      number: 99.9,
      suffix: "%",
      label: "Uptime Guarantee",
      key: "uptime",
    },
    {
      icon: Target,
      number: 24,
      suffix: "/7",
      label: "Support",
      key: "support",
    },
  ];

  useEffect(() => {
    if (isInView) {
      const animateCounter = (key, target, isFloat = false) => {
        let current = 0;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCounters((prev) => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setCounters((prev) => ({
              ...prev,
              [key]: isFloat
                ? Math.round(current * 10) / 10
                : Math.round(current),
            }));
          }
        }, duration / steps);
      };

      animateCounter("clients", 500);
      animateCounter("projects", 50);
      animateCounter("uptime", 99.9, true);
      animateCounter("support", 24);
    }
  }, [isInView]);

  return (
    <section
      ref={ref}
      id="about"
      className="py-24 bg-[#F8FAFC] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          {...contentStagger}
        >
          {/* Content Side */}
          <motion.div {...depthFade} className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                About{" "}
                <span
                  className="inline-block px-6 py-2 text-white rounded-2xl shadow-lg"
                  style={{
                    background: "linear-gradient(to right, #10B5DB, #0a7a9a)",
                  }}
                >
                  Globium Clouds{" "}
                </span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are a leading cloud solutions provider dedicated to helping
                businesses harness the power of cloud technology. With years of
                experience in cloud architecture, DevOps, and digital
                transformation, we empower organizations to scale efficiently
                and innovate rapidly.
              </p>
              <p className="text-lg text-gray-600 mt-4 leading-relaxed">
                Our mission is to bridge the gap between complex cloud
                technologies and business success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                className="bg-[#F8FAFC]/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-blue-100"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B5DB]" /> Our
                  Vision
                </h3>
                <p className="text-sm text-gray-600">
                  To democratize cloud technology and make it accessible to
                  businesses worldwide.
                </p>
              </motion.div>

              <motion.div
                className="bg-[#F8FAFC]/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-blue-100"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B5DB]" /> Our
                  Values
                </h3>
                <p className="text-sm text-gray-600">
                  Innovation, reliability, security, and customer-centric
                  solutions.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8FAFC]/90 backdrop-blur-sm rounded-[2rem] p-8 shadow-xl border border-blue-50 text-center relative group overflow-hidden"
              >
                {/* Subtle Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B5DB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-7 h-7" style={{ color: "#10B5DB" }} />
                </div>

                <div className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                  {counters[stat.key]}
                  {stat.suffix}
                </div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-[#10B5DB] group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
    </section>
  );
}
