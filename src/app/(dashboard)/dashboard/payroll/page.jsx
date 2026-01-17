"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function PayrollAdminPage() {
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('payroll', 'view');
  const canEdit = hasPermission('payroll', 'edit');
  const canPay = hasPermission('payroll', 'approve') || hasPermission('payroll', 'edit');

  const [filters, setFilters] = useState({ month: 'all', year: '', agent: '', status: 'all' });
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canView) fetchPayrolls();
  }, [canView]);

  async function fetchPayrolls() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month && filters.month !== 'all') params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.agent) params.append('agent', filters.agent);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);

      const res = await fetch(`/api/payroll?${params.toString()}`);
      // Be defensive: some endpoints may return empty body or non-JSON on error
      const text = await res.text();
      if (!text) {
        // empty response -> treat as no data
        setPayrolls([]);
      } else {
        let json;
        try {
          json = JSON.parse(text);
        } catch (err) {
          throw new Error('Invalid JSON response from server');
        }
        if (!json.success) throw new Error(json.error || 'Failed to load');
        setPayrolls(json.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  }

  async function togglePaid(payroll) {
    if (!canPay) return toast.error('Insufficient permissions');
    const newStatus = payroll.status === 'paid' ? 'unpaid' : 'paid';
    try {
      const res = await fetch(`/api/payroll/${payroll._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      toast.success(json.message || 'Updated');
      fetchPayrolls();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update payroll status');
    }
  }

  function openPayslip(payroll) {
    // opens a new printable page for the payroll payslip
    window.open(`/dashboard/payroll/payslip/${payroll._id}`, '_blank');
  }

  if (!canView) return <div className="p-6">You do not have permission to view payrolls.</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between space-y-4 mt-5">
          <CardTitle>Payroll Management</CardTitle>
          <div className="flex gap-2">
            <Select value={filters.month} onValueChange={(v) => setFilters(prev => ({ ...prev, month: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={(i+1).toString()}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input placeholder="Year (e.g. 2026)" value={filters.year} onChange={(e)=> setFilters(prev=>({...prev, year: e.target.value}))} />

            <Select value={filters.status} onValueChange={(v)=> setFilters(prev=>({...prev, status: v}))}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchPayrolls} className="ml-2">Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8">No payrolls found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-600">
                    <th className="px-4 py-2">Agent</th>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Gross</th>
                    <th className="px-4 py-2">Deductions</th>
                    <th className="px-4 py-2">Net</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map(p => (
                    <tr key={p._id} className="border-t">
                      <td className="px-4 py-3">{p.agent?.agentName || p.agent?.firstName || '—'}</td>
                      <td className="px-4 py-3">{p.month}</td>
                      <td className="px-4 py-3">{p.year}</td>
                      <td className="px-4 py-3">{p.financials?.grossSalary ?? p.grossSalary}</td>
                      <td className="px-4 py-3">{p.financials?.totalDeduction ?? p.totalDeduction}</td>
                      <td className="px-4 py-3">{p.financials?.netSalary ?? p.netSalary}</td>
                      <td className="px-4 py-3">{p.status}{p.paymentDate ? ` • ${new Date(p.paymentDate).toLocaleDateString()}` : ''}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={()=> openPayslip(p)} disabled={p.status !== 'paid'}>Payslip</Button>
                          <Button size="sm" onClick={()=> togglePaid(p)}>{p.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
