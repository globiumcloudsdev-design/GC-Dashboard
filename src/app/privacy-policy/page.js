import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Globium Clouds",
  description: "Learn how Globium Clouds collects, uses, and protects your personal information. Our privacy policy outlines our commitment to data security and user rights.",
  keywords: "privacy policy, data protection, Globium Clouds, software development, Karachi, Pakistan, data security",
  openGraph: {
    title: "Privacy Policy | Globium Clouds",
    description: "Our commitment to protecting your personal information and data privacy.",
    url: "https://globiumclouds.com/privacy-policy",
    siteName: "Globium Clouds",
    locale: "en_US",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  // Use a hardcoded date or a string to avoid Hydration Mismatch
  const lastUpdated = "October 24, 2023"; 

  return (
    <div className="min-h-screen bg-white selection:bg-[#10B5DB]/10">
      <Header />
      
      <main className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <header className="mb-16 border-b border-gray-100 pb-10">
            <h1 className="text-4xl md:text-6xl font-black text-[#10B5DB] mb-6 tracking-tight">
              Privacy Policy
            </h1>
          
          </header>

          {/* Content Sections */}
          <article className="prose prose-lg max-w-none text-gray-600 leading-relaxed prose-headings:text-gray-900 prose-strong:text-gray-800 prose-ul:list-disc">
            
            <section className="mb-12 scroll-mt-24" id="introduction">
              <h2 className="text-3xl font-bold mb-4">Introduction</h2>
              <p>
                At <strong>Globium Clouds</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with our software solutions.
              </p>
              <p>
                As a leading software development company based in Karachi, Pakistan, we provide custom software solutions, web development, mobile applications, AI solutions, and digital transformation services.
              </p>
            </section>

            <section className="mb-12 scroll-mt-24" id="collection">
              <h2 className="text-3xl font-bold mb-4">Information We Collect</h2>
              <p className="mb-4">We may collect the following types of information to provide better services:</p>
              <ul className="space-y-3">
                <li><span className="font-bold text-[#10B5DB]">Personal Information:</span> Name, email, and company details provided through inquiries.</li>
                <li><span className="font-bold text-[#10B5DB]">Usage Data:</span> Interaction data including pages visited and time spent on site.</li>
                <li><span className="font-bold text-[#10B5DB]">Technical Information:</span> IP addresses, browser types, and device identifiers.</li>
                <li><span className="font-bold text-[#10B5DB]">Communication Data:</span> Records of feedback and correspondence.</li>
              </ul>
            </section>

            <section className="mb-12" id="security">
              <h2 className="text-3xl font-bold mb-4">Data Security</h2>
              <div className="bg-blue-50/50 border-l-4 border-[#10B5DB] p-6 rounded-r-xl">
                <p className="mb-4 italic">
                  We implement industry-standard technical measures to protect your data, including:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none pl-0">
                  <li className="flex items-center gap-2">✅ SSL/TLS Encryption</li>
                  <li className="flex items-center gap-2">✅ Secure Storage Access</li>
                  <li className="flex items-center gap-2">✅ Regular Security Audits</li>
                  <li className="flex items-center gap-2">✅ Employee Data Training</li>
                </ul>
              </div>
            </section>

            <section className="mb-12" id="rights">
              <h2 className="text-3xl font-bold mb-4">User Rights</h2>
              <p>Under global data protection standards, you have the right to <strong>access, rectify, or erase</strong> your personal data. If you wish to exercise these rights, our team is ready to assist you.</p>
            </section>

            {/* Contact Card */}
            <section className="mt-20" id="contact">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl transition-transform hover:scale-[1.01] duration-300">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[#10B5DB] text-xl font-bold mb-4">Globium Clouds</h3>
                    <address className="not-italic text-gray-300 space-y-2">
                      <p>House R-84, near Al-Habeeb Restaurant</p>
                      <p>Sector 15-A/4, Buffer Zone</p>
                      <p>Karachi, Sindh 75850, Pakistan</p>
                    </address>
                  </div>
                  <div className="flex flex-col justify-center space-y-3">
                    <p className="flex items-center gap-3">
                      <span className="text-[#10B5DB]">Phone:</span> 
                      <a href="tel:+923352778488" className="hover:text-[#10B5DB] transition-colors">+92 335 2778488</a>
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-[#10B5DB]">Email:</span> 
                      <a href="mailto:globiumclouds@gmail.com" className="hover:text-[#10B5DB] transition-colors">globiumclouds@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}