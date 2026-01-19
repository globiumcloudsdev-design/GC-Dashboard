"use client";
import React, { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function LetterPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id, type } = resolvedParams;
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAgent();
  }, [id]);

  async function loadAgent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load agent');
      setAgent(json.data || json.agent); // Handle both data and agent properties
    } catch (e) {
      console.error(e);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  }

  function doPrint() {
    window.print();
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading letter details...</div>;
  if (!agent) return <div className="flex items-center justify-center min-h-screen">Agent not found</div>;

  const letterTitles = {
    offer: 'Offer Letter',
    appointment: 'Appointment Letter',
    confirmation: 'Confirmation Letter',
    increment: 'Increment Prediction Letter',
    experience: 'Experience Letter',
    relieving: 'Relieving Letter'
  };

  const title = letterTitles[type] || 'Letter';
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  const renderContent = () => {
    const commonHeader = (
      <div className="mb-8">
        <p className="font-bold">{currentDate}</p>
        <br />
        <p className="font-bold">{agent.agentName}</p>
        <p>{agent.address || 'Karachi, Pakistan'}</p>
        <p>CNIC: {agent.cnic || '________________'}</p>
      </div>
    );

    const salutation = (
      <div className="mb-6">
        <p><strong>Subject: {title}</strong></p>
        <br />
        <p>Dear {agent.agentName},</p>
      </div>
    );

    const closing = (
      <div className="mt-12">
        <p>Sincerely,</p>
        <br />
        <br />
        <div className="w-48 border-t border-black mb-1"></div>
        <p className="font-bold">HR Manager</p>
        <p>Globium Clouds</p>
      </div>
    );
    
    // TEMPLATES
    const joiningDate = agent.joiningDate || agent.createdAt;
    
    if (type === 'offer') {
      return (
        <>
          {commonHeader}
          {salutation}
          <div className="space-y-4 text-justify leading-relaxed">
            <p>
              We are pleased to offer you the position of <strong>{agent.designation || 'Sales Agent'}</strong> at Globium Clouds. 
              We were impressed with your qualifications and believe effectively that your skills and experience will be a valuable asset to our team.
            </p>
            <p>
              Your starting salary will be <strong>PKR {agent.basicSalary?.toLocaleString() || '_____'}</strong> per month, 
              plus standard benefits as per company policy. You will be reporting to the Team Lead of your department.
            </p>
            <p>
              Your expected joining date is <strong>{joiningDate ? format(new Date(joiningDate), 'MMMM dd, yyyy') : '___________'}</strong>. 
              Please sign and return the duplicate copy of this letter as a token of your acceptance.
            </p>
            <p>
              We look forward to welcoming you to Globium Clouds.
            </p>
          </div>
          {closing}
          <div className="mt-16 pt-8 border-t border-gray-300">
             <p className="font-bold mb-4">Acceptance</p>
             <p>I, <strong>{agent.agentName}</strong>, accept the terms and conditions of this offer.</p>
             <div className="mt-8 flex justify-between w-1/2">
                <div>
                   <div className="w-40 border-t border-black mb-1"></div>
                   <p className="text-sm">Signature</p>
                </div>
                <div>
                   <div className="w-40 border-t border-black mb-1"></div>
                   <p className="text-sm">Date</p>
                </div>
             </div>
          </div>
        </>
      );
    }

    if (type === 'appointment') {
      return (
        <>
          {commonHeader}
          {salutation}
          <div className="space-y-4 text-justify leading-relaxed">
            <p>
              With reference to your application and subsequent interviews, we are pleased to appoint you as <strong>{agent.designation || 'Sales Agent'}</strong> 
              at Globium Clouds, effective from <strong>{joiningDate ? format(new Date(joiningDate), 'MMMM dd, yyyy') : currentDate}</strong>.
            </p>
            <p>
              <strong>Terms and Conditions:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
               <li><strong>Probation:</strong> You will be on a probation period of 3 months from the date of joining.</li>
               <li><strong>Compensation:</strong> Your monthly gross salary will be <strong>PKR {agent.basicSalary?.toLocaleString() || '_____'}</strong>.</li>
               <li><strong>Working Hours:</strong> Your shift timings will be {agent.shift?.startTime || '___'} to {agent.shift?.endTime || '___'}.</li>
               <li><strong>Notice Period:</strong> Either party can terminate this employment by giving one month notice or salary in lieu thereof.</li>
            </ul>
            <p>
              Please sign the duplicate copy of this letter in token of your acceptance of the terms and conditions of employment.
            </p>
            <p>
              We welcome you to the Globium Clouds family and wish you a successful career with us.
            </p>
          </div>
          {closing}
        </>
      );
    }

    if (type === 'confirmation') {
      return (
        <>
          {commonHeader}
          {salutation}
          <div className="space-y-4 text-justify leading-relaxed">
            <p>
              Consequent to the review of your performance during your probation period, we are pleased to confirm your services 
              as <strong>{agent.designation || 'Sales Agent'}</strong> with effect from <strong>{currentDate}</strong>.
            </p>
            <p>
              All other terms and conditions of your employment remain unchanged. 
              We hope that you will continue to contribute effectively towards the growth of the organization.
            </p>
            <p>
               We wish you all the best for your future assignments.
            </p>
          </div>
          {closing}
        </>
      );
    }

    if (type === 'increment') {
      return (
        <>
          {commonHeader}
          {salutation}
          <div className="space-y-4 text-justify leading-relaxed">
            <p>
               In recognition of your performance and contribution to the organization during the past year, 
               management is pleased to revise your salary structure.
            </p>
            <p>
               Your monthly basic salary has been revised to <strong>PKR {agent.basicSalary?.toLocaleString() || '_____'}</strong>, 
               effective from <strong>{currentDate}</strong>.
            </p>
            <p>
               We appreciate your hard work and dedication and look forward to your continued contribution to the success of Globium Clouds.
            </p>
          </div>
          {closing}
        </>
      );
    }

    if (type === 'experience') {
      return (
        <>
          <div className="mb-8 text-center">
             <h2 className="text-xl font-bold underline uppercase">TO WHOM IT MAY CONCERN</h2>
          </div>
          <div className="space-y-4 text-justify leading-relaxed mt-12">
            <p>
              This is to certify that Mr./Ms. <strong>{agent.agentName}</strong> (ID: {agent.agentId}) has been working with Globium Clouds 
              as a <strong>{agent.designation || 'Sales Agent'}</strong> since <strong>{joiningDate ? format(new Date(joiningDate), 'MMMM dd, yyyy') : '___________'}</strong>.
            </p>
            <p>
              During their tenure with us, we found them to be sincere, hardworking, and dedicated to their duties. 
              {agent.gender === 'Female' ? 'She' : 'He'} bears a good moral character.
            </p>
            <p>
              We wish {agent.gender === 'Female' ? 'her' : 'him'} all the best in {agent.gender === 'Female' ? 'her' : 'his'} future endeavors.
            </p>
          </div>
          {closing}
        </>
      );
    }

    if (type === 'relieving') {
      return (
        <>
          {commonHeader}
          {salutation}
          <div className="space-y-4 text-justify leading-relaxed">
            <p>
               This has reference to your resignation letter dated <strong>__________</strong>.
            </p>
            <p>
               We would like to inform you that your resignation has been accepted, and you are relieved from your services 
               at Globium Clouds effective from the closing working hours of <strong>{currentDate}</strong>.
            </p>
            <p>
               We certify that you have cleared all dues and have no outstanding liabilities towards the organization.
            </p>
            <p>
               We thank you for your services and wish you success in your future endeavors.
            </p>
          </div>
          {closing}
        </>
      );
    }

    return <div>Invalid Letter Type</div>;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          html, body { height: 100%; margin: 0; padding: 0; }
          /* Hide everything by default, then reveal only the letter area */
          body * { visibility: hidden; }
          .letter-print-area, .letter-print-area * { visibility: visible; }
          .letter-print-area { 
            position: relative; 
            left: 0; 
            top: 0; 
            width: 210mm; 
            min-height: 297mm; /* allow content to flow and footer to remain visible */
            box-shadow: none !important;
            background: white !important;
          }
          /* Keep interactive UI hidden on print */
          .print-hidden { display: none !important; }
          /* Force printing of background colors for critical elements */
          .letter-print-area .print-color-exact {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            background-color: #111827 !important; /* tailwind bg-gray-800 */
          }
        }
      `}</style>
      
      {/* Print Controls */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between print:hidden px-4 sm:px-0">
        <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft size={16} /> Back
        </Button>
        <Button onClick={doPrint} className="bg-[#10B5DB] hover:bg-[#0e9ab9] gap-2">
          <Printer size={16} /> Print / Save PDF
        </Button>
      </div>

      {/* A4 Paper Container */}
      <div className="letter-print-area max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:w-full min-h-[297mm] flex flex-col print:m-0 print:p-0 relative">
        
        {/* Header Strip */}
        <div className="bg-[#10B5DB] h-3 w-full print-color-exact"></div>

        {/* Letterhead */}
        <div className="px-12 pt-8 pb-4 flex justify-between items-center border-b border-gray-100">
             <div className="w-20 h-20 relative">
                 <Image src="/images/GCLogo.png" alt="Globium Clouds" fill className="object-contain" priority />
             </div>
             <div className="text-right">
                 <h1 className="text-xl font-bold text-gray-800">GLOBIUM CLOUDS</h1>
                 <p className="text-xs text-gray-500">Software & IT Solutions</p>
                 <p className="text-xs text-gray-400">Karachi, Pakistan</p>
                 <p className="text-xs text-gray-400">+92 300 1234567 | info@globiumclouds.com</p>
             </div>
        </div>

        {/* Content Body */}
        <div className="p-12 flex-1 text-sm text-gray-800 font-serif">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-auto">
            <div className="bg-gray-800 h-8 w-full print:bg-gray-800 print-color-exact flex items-center justify-center">
                <p className="text-[10px] text-white tracking-widest uppercase">Globium Clouds • Excellence in Innovation</p>
            </div>
        </div>

      </div>
    </div>
  );
}