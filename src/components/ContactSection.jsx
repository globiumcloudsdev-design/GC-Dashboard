"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { addContact } from "@/action/contactActions";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Message is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Sending message...');

    try {
      const payload = {
        webName: "Globium Clouds",
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };
      await addContact(payload);
      toast.success('Message sent successfully!', { id: toastId });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "globiumclouds@gmail.com",
      description: "Drop us a line anytime."
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+92 335 2778488",
      description: "Mon-Sat, 9am - 6pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Buffer Zone, Sector 15-A/4",
      description: "Karachi, Pakistan"
    }
  ];

  return (
    <section id="contact" className="py-28 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#10B5DB]/5 -skew-x-12 translate-x-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Info */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-[#10B5DB]" />
                <span className="text-[#10B5DB] font-bold tracking-[0.3em] text-xs uppercase">Get In Touch</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                LET'S BUILD <br />
                <span className="text-transparent bg-clip-text bg-[#10B5DB] to-blue-600">SOMETHING</span> <br />
                GREAT.
              </h2>
              <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                Ready to transform your business with cloud solutions? Let's discuss your next big project.
              </p>
            </div>

            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#10B5DB] group-hover:bg-[#10B5DB] group-hover:text-white transition-all duration-500 shadow-sm">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{info.title}</h4>
                    <p className="text-lg font-bold text-gray-900">{info.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your project goals..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#10B5DB] transition-all outline-none text-gray-900 resize-none placeholder:text-gray-300"
                />
              </div>

              <motion.button
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10B5DB] text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-lg shadow-[#10B5DB]/20 hover:bg-[#0aa0c2] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}