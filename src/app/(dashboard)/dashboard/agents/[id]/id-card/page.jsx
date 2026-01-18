"use client";

import React, { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { toast } from 'sonner';
import { Printer, ArrowLeft, Download, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function IDCardPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
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
      setAgent(json.data || json.agent);
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-muted-foreground">Generating ID Card...</p>
    </div>
  );
  
  if (!agent) return <div className="flex items-center justify-center min-h-screen">Agent not found</div>;

  // Get Profile Photo if exists (looking for type 'Profile Photo')
  const profilePhoto = agent.documents?.find(d => d.type === 'Profile Photo' || d.type === 'Photos')?.url || null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 flex flex-col items-center print:bg-white print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-hidden { display: none !important; }
          .id-card-container { margin: 0; display: flex; flex-direction: row; gap: 20px; page-break-inside: avoid; }
          /* Center content on page for easy cutting */
          .print-center { 
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>

      {/* Controls */}
      <div className="w-full max-w-4xl mx-auto mb-8 flex justify-between px-4 print:hidden">
        <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft size={16} /> Back
        </Button>
        <div className="flex gap-2">
            <Button onClick={doPrint} className="bg-[#10B5DB] hover:bg-[#0e9ab9] gap-2">
            <Printer size={16} /> Print Card
            </Button>
        </div>
      </div>

      <div className="print-center">
        <div className="id-card-container flex flex-col md:flex-row gap-8 items-center justify-center">
            
            {/* FRONT SIDE */}
            {/* Standard ID Card Size: 2.125" x 3.375" (approx 54mm x 86mm for Vertical) */}
            {/* Using aspect ratio roughly 216px x 344px (multiplied by 3 for High Res - 648x1032 approx) */}
            
            <div className="relative w-[320px] h-[500px] bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none border border-slate-200 print:border-slate-300">
                {/* Background Design */}
                <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-b from-[#0a2342] to-[#104080] rounded-b-[40%]"></div>
                
                {/* Logo */}
                <div className="absolute top-6 left-0 w-full flex justify-center z-10">
                    <div className="relative h-12 w-40">
                         {/* Replace with your logo path */}
                        <Image 
                            src="/images/GCLogo.png" 
                            alt="Globium Clouds" 
                            fill 
                            className="object-contain brightness-0 invert" 
                            priority
                        />
                    </div>
                </div>

                {/* Profile Photo Area */}
                <div className="absolute top-[100px] left-0 w-full flex justify-center z-20">
                    <div className="w-[140px] h-[140px] rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden relative">
                        {profilePhoto ? (
                            <Image src={profilePhoto} alt="Profile" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                <CreditCard size={40} />
                                <span className="text-[10px] mt-2">No Photo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="absolute top-[260px] w-full px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-2">
                        {agent.agentName?.split(' ').slice(0, 2).join(' ')}
                    </h2>
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                        {agent.designation || 'Sales Agent'}
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-left px-2">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Employee ID</p>
                            <p className="font-mono font-bold text-slate-800 text-lg">{agent.agentId}</p>
                        </div>
                         <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Joining Date</p>
                            <p className="font-bold text-slate-800 text-sm mt-1">
                                {agent.createdAt ? format(new Date(agent.createdAt), 'MM/yyyy') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Stripe */}
                <div className="absolute bottom-0 w-full bg-[#10B5DB] h-3"></div>
                <div className="absolute bottom-3 w-full bg-[#0a2342] h-10 flex items-center justify-center">
                   <p className="text-white text-[10px] uppercase tracking-[0.2em] font-medium">Globium Clouds Pvt Ltd</p>
                </div>
            </div>

            {/* BACK SIDE */}
            <div className="relative w-[320px] h-[500px] bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none border border-slate-200 print:border-slate-300">
                {/* Header */}
                <div className="w-full h-16 bg-[#0a2342] flex items-center justify-center">
                    <h3 className="text-white text-sm font-bold tracking-widest uppercase">Terms & Conditions</h3>
                </div>

                <div className="p-8 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Emergency Contact</p>
                      <p className="text-sm font-bold text-slate-800">+92 335 2778488</p>
                      <p className="text-[10px] text-slate-400">Human Resources</p>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Email Support</p>
                      <p className="text-sm font-bold text-slate-800">hr@globiumclouds.com</p>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500 font-semibold uppercase">Office Address</p>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed px-4">
                     R-84, Sector 15-A/4 Sector 15 A 4 North Karachi, Karachi, 75850, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 bg-white border border-slate-200 p-1 flex items-center justify-center">
                       <img 
                        src={agent.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`ID:${agent.agentId}|NAME:${agent.agentName}`)}`} 
                        alt="QR Code" 
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-center px-2">
                       <p className="text-[10px] text-justify leading-relaxed text-slate-500 italic">
                        This card is the property of Globium Clouds. It is non-transferable and must be returned upon termination of employment. If found, please return to the address mentioned above.
                      </p>
                    </div>
                  </div>
                </div>

                 {/* Footer Stripe */}
                 <div className="absolute bottom-0 w-full bg-[#10B5DB] h-2"></div>
            </div>

        </div>

        <div className="text-center mt-8 print:hidden">
            <p className="text-sm text-slate-500">
                Tip: Print this page on Card Stock paper. <br/>Use "Background Graphics" enabled in print settings.
            </p>
        </div>
      </div>
    </div>
  );
}
