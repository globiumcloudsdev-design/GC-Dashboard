"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { addContact } from "@/action/contactActions";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.message.trim()) {
      toast.error("Message is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Sending message...");

    try {
      const payload = {
        webName: "Globium Clouds",
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };
      await addContact(payload);
      toast.success("Message sent successfully!", { id: toastId });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error.message || "Failed to send message. Please try again.",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "globiumclouds@gmail.com",
      description: "Drop us a line anytime.",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+92 335 2778488",
      description: "Mon-Sat, 9am - 6pm",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Buffer Zone, Sector 15-A/4",
      description: "Karachi, Pakistan",
    },
  ];

  return (
    <section id="contact" className="py-28 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#10B5DB]/5 -skew-x-12 translate-x-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-[#10B5DB]" />
                <span className="text-[#10B5DB] font-bold tracking-[0.3em] text-xs uppercase">
                  Get In Touch
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                LET'S BUILD <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B5DB] to-blue-600">
                  SOMETHING
                </span>{" "}
                <br />
                GREAT.
              </h2>
              <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                Ready to transform your business with cloud solutions? Let's
                discuss your next big project.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-6 p-6 rounded-[2rem] bg-gray-50/50 border border-transparent hover:border-[#10B5DB]/20 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group"
                >
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#10B5DB] group-hover:bg-[#10B5DB] group-hover:text-white transition-all duration-500 shadow-sm">
                    <info.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {info.title}
                    </h4>
                    <p className="text-lg font-bold text-gray-900 break-all lg:break-normal">
                      {info.details}
                    </p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Visual Balance Decoration */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#10B5DB]/10 to-transparent rounded-[3rem] blur-2xl -z-10" />

            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 space-y-8 relative overflow-hidden"
            >
              {/* Form Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#10B5DB]/10 to-transparent rounded-bl-[100%]" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help your business?"
                  className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300 font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Tell us about your project or vision..."
                  className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 resize-none placeholder:text-gray-300 font-medium"
                />
              </div>

              <motion.button
                whileHover={
                  !isSubmitting
                    ? {
                        scale: 1.01,
                        boxShadow: "0 20px 40px -10px rgba(16, 181, 219, 0.3)",
                      }
                    : {}
                }
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10B5DB] text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl shadow-xl shadow-[#10B5DB]/20 hover:bg-[#0aa0c2] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isSubmitting
                  ? "ENGINEERING YOUR MESSAGE..."
                  : "SEND PROJECT BRIEF"}{" "}
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
