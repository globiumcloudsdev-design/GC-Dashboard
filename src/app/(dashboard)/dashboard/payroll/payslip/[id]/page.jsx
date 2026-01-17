"use client";
import React, { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

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

  const fmt = (v) => {
    const val = Number(v || 0);
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);
    } catch (e) {
      return `PKR ${val}`;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!payroll) return <div className="p-6">No payroll found</div>;

  const fin = payroll.financials || {};

  // Safe stats values to avoid NaN in rendering
  const stats = payroll.stats || {};
  const presentDaysVal = Number(stats.presentDays ?? payroll.presentDays ?? 0);
  const totalLatesVal = Number(stats.totalLates ?? payroll.totalLates ?? 0);
  const uninformedAbsentsVal = Number(stats.uninformedAbsents ?? 0);
  const informedAbsentsVal = Number(stats.informedAbsents ?? 0);
  const convertedAbsentsVal = Number(stats.convertedAbsents ?? 0);
  const absentDaysVal = (uninformedAbsentsVal + informedAbsentsVal + convertedAbsentsVal) || Number(payroll.absentDays ?? 0);

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-md print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b print:border-b-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 relative">
              <Image src="/images/GCLogo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <div className="text-xl font-bold">Globium Clouds</div>
              <div className="text-sm text-muted-foreground">Payroll Department</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold">Payslip</div>
            <div className="text-sm text-muted-foreground">{payroll.month}/{payroll.year}</div>
            <div className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${payroll.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {payroll.status?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Employee & Payroll Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div>
            <div className="text-xs text-muted-foreground">Employee</div>
            <div className="font-medium text-lg">{payroll.agent?.agentName || `${payroll.agent?.firstName || ''} ${payroll.agent?.lastName || ''}`}</div>
            <div className="text-sm text-muted-foreground">{payroll.agent?.email || '—'}</div>
            <div className="mt-2 text-sm"><span className="text-muted-foreground">Agent ID:</span> <span className="font-medium">{payroll.agent?._id || '—'}</span></div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Payroll Info</div>
            <div className="mt-1 text-sm"><span className="text-muted-foreground">Generated:</span> <span className="font-medium">{new Date(payroll.generatedAt || payroll.createdAt || Date.now()).toLocaleDateString()}</span></div>
            <div className="mt-1 text-sm"><span className="text-muted-foreground">Payment Date:</span> <span className="font-medium">{payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : '—'}</span></div>
            <div className="mt-1 text-sm"><span className="text-muted-foreground">Payroll ID:</span> <span className="font-medium">{payroll._id}</span></div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="p-6">
          <div className="text-sm text-muted-foreground mb-3">Salary Breakdown</div>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto">
              <tbody>
                <tr className="border-t">
                  <td className="py-3">Basic Salary</td>
                  <td className="py-3 text-right">{fmt(fin.basicSalary ?? payroll.basicSalary)}</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3">Attendance Allowance</td>
                  <td className="py-3 text-right">{fmt(fin.earnedAllowance ?? payroll.attendanceAllowance)}</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3">Incentive</td>
                  <td className="py-3 text-right">{fmt(fin.earnedIncentive ?? payroll.earnedIncentive)}</td>
                </tr>
                <tr className="border-t font-medium">
                  <td className="py-3">Gross Salary</td>
                  <td className="py-3 text-right">{fmt(fin.grossSalary ?? payroll.grossSalary)}</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3">Deductions</td>
                  <td className="py-3 text-right">{fmt(fin.totalDeduction ?? payroll.totalDeduction)}</td>
                </tr>
                <tr className="border-t font-semibold bg-gray-50">
                  <td className="py-3">Net Pay</td>
                  <td className="py-3 text-right">{fmt(fin.netSalary ?? payroll.netSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="p-3 border rounded text-sm">
              <div className="text-xs text-muted-foreground">Present Days</div>
              <div className="font-medium">{Number.isFinite(presentDaysVal) ? String(presentDaysVal) : '—'}</div>
            </div>
            <div className="p-3 border rounded text-sm">
              <div className="text-xs text-muted-foreground">Total Lates</div>
              <div className="font-medium">{Number.isFinite(totalLatesVal) ? String(totalLatesVal) : '—'}</div>
            </div>
            <div className="p-3 border rounded text-sm">
              <div className="text-xs text-muted-foreground">Absent Days</div>
              <div className="font-medium">{Number.isFinite(absentDaysVal) ? String(absentDaysVal) : '—'}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-muted-foreground">Notes</div>
            <div className="mt-2 text-sm">{payroll.notes || 'No additional notes.'}</div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm">
              <div className="text-muted-foreground">Prepared By</div>
              <div className="font-medium mt-6">HR / Finance</div>
            </div>
            <div className="text-sm text-right">
              <div className="text-muted-foreground">Signature</div>
              <div className="mt-6">__________________________</div>
            </div>
          </div>
        </div>

        {/* Actions (hidden on print) */}
        <div className="p-4 border-t flex justify-end gap-2 print:hidden">
          <Button onClick={doPrint} className="bg-blue-600 text-white">Print / Save</Button>
        </div>
      </div>
    </div>
  );
}
