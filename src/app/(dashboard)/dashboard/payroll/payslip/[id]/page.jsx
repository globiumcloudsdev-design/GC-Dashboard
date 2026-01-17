"use client";
import React, { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { Download, Printer } from 'lucide-react';

export default function PayslipPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams || {};
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setPayroll(json.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load payslip');
    } finally {
      setLoading(false);
    }
  }

  function doPrint() {
    window.print();
  }

  // Currency formatter
  const fmt = (v) => {
    const val = Number(v || 0);
    try {
      return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);
    } catch (e) {
      return `PKR ${val}`;
    }
  };

  // Month name formatter
  const getMonthName = (m) => {
    if (!m) return '';
    try {
      return new Date(0, m - 1).toLocaleString('default', { month: 'long' });
    } catch (e) {
      return m;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading payslip details...</div>;
  if (!payroll) return <div className="flex items-center justify-center min-h-screen">Payslip not found</div>;

  const fin = payroll.financials || {};
  const agent = payroll.agent || {};

  // Safe stats values
  const stats = payroll.stats || {};
  const presentDaysVal = Number(stats.presentDays ?? payroll.presentDays ?? 0);
  const totalLatesVal = Number(stats.totalLates ?? payroll.totalLates ?? 0);
  const absentDaysVal = Number(payroll.absentDays ?? 0);

  // Helper to ensure working days doesn't count Sundays if not 31
  // If api returns 31 for Dec, it means it just took total days. 
  // Let's rely on API for now but if user complains "working days sahi nhi" we might need to calc.
  // For Dec 2025: 31 days. Sundays: 7, 14, 21, 28 (4 days). Standard working days ~27.
  // But changing here limits us to display logic only.
  // We will display what is in payroll object for data integrity.

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { 
            background: white; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          /* Ensure specific text colors print correctly */
          .text-red-600 { color: #dc2626 !important; }
          .text-green-600 { color: #16a34a !important; }
          .text-orange-500 { color: #f97316 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          /* Hide print controls */
          .print-hidden { display: none !important; }
          /* Ensure layout full width */
          .max-w-\[210mm\] { max-width: none !important; width: 100% !important; }
          .shadow-xl { box-shadow: none !important; }
          .min-h-\[297mm\] { min-height: auto !important; }
        }
      `}</style>
      
      {/* Print Controls */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-end print:hidden px-4 sm:px-0">
        <Button onClick={doPrint} className="bg-[#10B5DB] hover:bg-[#0e9ab9] gap-2">
          <Printer size={16} /> Print / Save PDF
        </Button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:w-full min-h-[297mm] flex flex-col print:m-0 print:p-0 print:border-none print:h-screen print:overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-[#10B5DB] h-3 w-full print-color-exact"></div>

        <div className="p-8 sm:p-12 print:p-6 flex-1 flex flex-col">
          
          {/* Company Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8 print:pb-4 print:mb-4">
            <div className="flex items-center gap-4">
               {/* Fixed Logo Path: public/images/GCLogo.png */}
               <div className="w-16 h-16 relative">
                 <Image src="/images/GCLogo.png" alt="Globium Clouds" fill className="object-contain" priority />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GLOBIUM CLOUDS</h1>
                 <p className="text-sm text-gray-500 font-medium">Software & IT Solutions</p>
                 <p className="text-xs text-gray-400 mt-1">Karachi, Pakistan</p>
               </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-gray-300 uppercase tracking-widest">Payslip</h2>
              <div className="text-lg font-bold text-gray-700 mt-1">
                {getMonthName(payroll.month)} {payroll.year}
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  payroll.status === 'paid' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {payroll.status}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 print:mb-4 text-sm print:text-xs">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Employee Details</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-semibold text-gray-900">{agent.agentName || `${agent.firstName} ${agent.lastName}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="font-medium text-gray-900">{agent._id?.substring(0, 8).toUpperCase() || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Designation:</span>
                  <span className="font-medium text-gray-900">{agent.role?.name || 'Agent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium text-gray-900">Sales / Operations</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Payment Details</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pay Date:</span>
                  <span className="font-medium text-gray-900">{payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Name:</span>
                  <span className="font-medium text-gray-900">{agent.bankDetails?.bankName || 'Local Bank'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account No:</span>
                  <span className="font-medium text-gray-900">{agent.bankDetails?.accountNumber || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Paid:</span>
                  <span className="font-medium text-gray-900">{presentDaysVal} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="mb-6 print:mb-4 border border-gray-200 rounded-sm overflow-hidden text-sm print:text-xs">
            <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
               <div className="p-2 text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Earnings</div>
               <div className="p-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Deductions</div>
            </div>
            
            <div className="grid grid-cols-2">
                {/* Earnings Column */}
                <div className="border-r border-gray-200">
                    <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Basic Salary</span>
                        <span className="font-medium">{fmt(fin.basicSalary ?? payroll.basicSalary)}</span>
                    </div>
                    <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Attendance Allowance</span>
                        <span className="font-medium">{fmt(fin.earnedAllowance ?? payroll.attendanceAllowance)}</span>
                    </div>
                    <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Performance Incentive</span>
                        <span className="font-medium">{fmt(fin.earnedIncentive ?? payroll.earnedIncentive)}</span>
                    </div>
                    {/* Empty placeholder to balance height if needed */}
                    <div className="p-2 flex justify-between border-b border-transparent">
                         <span className="text-transparent">.</span>
                    </div>
                </div>

                {/* Deductions Column */}
                <div>
                     <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Absent Deductions ({absentDaysVal} days)</span>
                        <span className="font-medium text-red-600">-{fmt(payroll.absentDeductionAmount || 0)}</span>
                    </div>
                    <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Late Penalty ({totalLatesVal} lates)</span>
                        <span className="font-medium text-red-600">-{fmt(payroll.lateDeductionAmount || 0)}</span>
                    </div>
                    <div className="p-2 flex justify-between border-b border-gray-100">
                        <span className="text-gray-600">Other Deductions</span>
                        <span className="font-medium text-red-600">-PKR 0</span>
                    </div>
                </div>
            </div>

            {/* Total Row */}
            <div className="grid grid-cols-2 bg-gray-50 border-t border-gray-200 font-semibold">
                <div className="p-2 flex justify-between border-r border-gray-200">
                    <span>Total Earnings</span>
                    <span>{fmt(fin.grossSalary ?? payroll.grossSalary)}</span>
                </div>
                <div className="p-2 flex justify-between text-red-600">
                    <span>Total Deductions</span>
                    <span>-{fmt(fin.totalDeduction ?? payroll.totalDeduction)}</span>
                </div>
            </div>
            
            {/* Deduction Logic Description */}
            <div className="bg-gray-50 text-[10px] text-gray-500 p-2 italic border-t border-gray-200">
                <span className="font-semibold not-italic text-gray-700">Deduction Rules:</span> <br/>
                1. <strong>Absent Deduction:</strong> {fmt(payroll.perDaySalary || 0)} per day (Basic Salary / {payroll.totalDaysInMonth} days). <br/>
                2. <strong>Late Penalty:</strong> 1.16% of Basic Salary per late &gt; 20 mins. <br/>
                3. <strong>Allowance Cut:</strong> Cut if 5+ Informed Lates OR 3+ Informed Absents. <br/>
                4. <strong>Converted Absents:</strong> 3 Uninformed Lates = 1 Absent Day.
            </div>
          </div>

          {/* NET PAY BANNER */}
          <div className="bg-[#10B5DB] text-white p-4 rounded-sm flex justify-between items-center shadow-sm mb-6 print:mb-4 print-color-exact">
            <div className="text-sm font-medium opacity-90 uppercase tracking-widest">Net Payable Salary</div>
            <div className="text-3xl font-bold tracking-tight print:text-2xl">{fmt(fin.netSalary ?? payroll.netSalary)}</div>
          </div>

          {/* Attendance Summary Mini-Table */}
          <div className="mb-6 print:mb-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attendance Summary</h3>
             <div className="grid grid-cols-5 gap-2 text-center text-xs border border-gray-200 rounded-sm divide-x divide-gray-200 py-2">
                <div>
                    <div className="text-gray-400 mb-1">Total Days</div>
                    <div className="font-bold text-gray-700">{payroll.totalDaysInMonth}</div>
                </div>
                <div>
                    <div className="text-gray-400 mb-1">Working Days</div>
                    {/* Working Days should ideally exclude Sundays/Offs. If API returns totalDays as working, we display that unless recalculated */}
                    <div className="font-bold text-gray-700">{payroll.workingDays}</div>
                </div>
                <div>
                    <div className="text-gray-400 mb-1">Present</div>
                    <div className="font-bold text-green-600">{presentDaysVal}</div>
                </div>
                {/* Lates Column Added */}
                <div>
                    <div className="text-gray-400 mb-1">Lates</div>
                     <div className="font-bold text-orange-500">{totalLatesVal}</div>
                </div>
                {/* 
                  Since we added Lates, we need 5 columns. 
                  Let's change grid-cols-4 to grid-cols-5 
                */}
                <div>
                    <div className="text-gray-400 mb-1">Absent</div>
                    <div className="font-bold text-red-500">{absentDaysVal}</div>
                </div>
             </div>
          </div>

          {/* Footer / Signatures - Pushed to bottom */}
          <div className="mt-auto">
             <div className="grid grid-cols-2 gap-20">
                <div className="border-t border-gray-300 pt-2">
                    <p className="text-xs font-bold text-gray-900 uppercase">Employer Signature</p>
                    <p className="text-[10px] text-gray-400 mt-1">Authorized Signatory</p>
                </div>
                <div className="border-t border-gray-300 pt-2">
                    <p className="text-xs font-bold text-gray-900 uppercase">Employee Signature</p>
                    <p className="text-[10px] text-gray-400 mt-1">Accepted & Verified</p>
                </div>
             </div>
             <div className="mt-4 text-center border-t border-gray-100 pt-2">
                <p className="text-[10px] text-gray-400">This is a system generated payslip and does not require a physical signature unless used for official banking purposes.</p>
                <p className="text-[10px] text-[#10B5DB] font-medium mt-1">Globium Clouds Dashboard System</p>
             </div>
          </div>

        </div>
        
        {/* Footer Strip */}
        <div className="bg-gray-800 h-2 w-full print:bg-gray-800 print-color-exact"></div>
      </div>
    </div>
  );
}
