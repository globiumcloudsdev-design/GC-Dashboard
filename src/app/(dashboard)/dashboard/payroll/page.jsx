"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Printer, Users, DollarSign, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PayrollAdminPage() {
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('payroll', 'view');
  const canEdit = hasPermission('payroll', 'edit');
  const canPay = hasPermission('payroll', 'approve') || hasPermission('payroll', 'edit');

  const today = new Date();
  const [filters, setFilters] = useState({ 
    month: (today.getMonth() + 1).toString(), 
    year: today.getFullYear().toString(), 
    agent: '', 
    status: 'all' 
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canView) fetchPayrolls(1); // load page 1 on mount or filter change
  }, [canView]); // removed filters dependency to avoid double fetch, trigger manually for filter
  
  // Trigger fetch when filters change (debounced or manual button?) - Instructions say "jb filter chale to data dikhao"
  // The existing code had a manual "Filter" button, which is good.
  // But we want initial load to use the defaults.
  
  // Let's modify:
  useEffect(() => {
     if(canView) fetchPayrolls(1);
  }, []); 

  async function fetchPayrolls(pageOverride) {
    setLoading(true);
    try {
      const page = pageOverride || pagination.page;
      const params = new URLSearchParams();
      if (filters.month && filters.month !== 'all') params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.agent) params.append('agent', filters.agent);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      params.append('page', page);
      params.append('limit', pagination.limit);

      const res = await fetch(`/api/payroll?${params.toString()}`);
      // Be defensive: some endpoints may return empty body or non-JSON on error
      const text = await res.text();
      if (!text) {
        setPayrolls([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
      } else {
        let json;
        try {
          json = JSON.parse(text);
        } catch (err) {
          throw new Error('Invalid JSON response from server');
        }
        if (!json.success) throw new Error(json.error || 'Failed to load');
        
        setPayrolls(json.data || []);
        if (json.pagination) {
            setPagination(prev => ({
                ...prev,
                page: json.pagination.page,
                totalPages: json.pagination.totalPages,
                total: json.pagination.total
            }));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchPayrolls(newPage);
  };

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

  function getMonthName(m) {
    if (!m) return '';
    try {
      const date = new Date(0, parseInt(m) - 1);
      return date.toLocaleString('default', { month: 'long' });
    } catch (e) {
      return m;
    }
  }

  function handleExportExcel() {
    if (payrolls.length === 0) return toast.error("No data to export");
    
    const data = payrolls.map(p => ({
      "Agent Name": p.agent?.agentName || p.agent?.firstName || p.agent?.lastName || "Unknown",
      "Agent ID": p.agent?.agentId || "",
      "Month": getMonthName(p.month),
      "Year": p.year,
      "Status": p.status,
      "Basic Salary": p.financials?.basicSalary || 0,
      "Gross Salary": p.financials?.grossSalary || p.grossSalary || 0,
      "Total Deductions": p.financials?.totalDeduction || p.totalDeduction || 0,
      "Net Salary": p.financials?.netSalary || p.netSalary || 0,
      "Payment Date": p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "-",
      "Generated At": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Report");
    XLSX.writeFile(wb, `Payroll_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel exported successfully");
  }

  function handlePrintReport() {
    if (payrolls.length === 0) return toast.error("No data to print");

    // Open a new window for printing the table view
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return toast.error("Pop-up blocked");

    const html = `
      <html>
        <head>
          <title>Payroll Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0; color: #666; }
            .status-paid { color: green; font-weight: bold; }
            .status-unpaid { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Globium Clouds - Payroll Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Month/Year</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              ${payrolls.map(p => `
                <tr>
                  <td>${p.agent?.agentName || p.agent?.firstName || '—'}</td>
                  <td>${getMonthName(p.month)} ${p.year}</td>
                  <td>${p.financials?.grossSalary || p.grossSalary}</td>
                  <td>${p.financials?.totalDeduction || p.totalDeduction}</td>
                  <td>${p.financials?.netSalary || p.netSalary}</td>
                  <td class="status-${p.status}">${p.status.toUpperCase()}</td>
                  <td>${p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function openPayslip(payroll) {
    // opens a new printable page for the payroll payslip
    window.open(`/dashboard/payroll/payslip/${payroll._id}`, '_blank');
  }

  const stats = useMemo(() => {
    return payrolls.reduce((acc, p) => {
      const net = Number(p.financials?.netSalary || p.netSalary || 0);
      acc.total += net;
      if (p.status === 'paid') acc.paid += net;
      else acc.pending += net;
      return acc;
    }, { total: 0, paid: 0, pending: 0 });
  }, [payrolls]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  if (!canView) return <div className="p-6">You do not have permission to view payrolls.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground">For current selection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</div>
            <p className="text-xs text-muted-foreground">Successfully transferred</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pending)}</div>
            <p className="text-xs text-muted-foreground">To be processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Headcount</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrolls.length}</div>
            <p className="text-xs text-muted-foreground">Slips generated</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Payroll Management</CardTitle>
                    <CardDescription>Manage, track and process employee salaries</CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <Select value={filters.month} onValueChange={(v) => setFilters(prev => ({ ...prev, month: v }))}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={(i+1).toString()}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>

                    <Input 
                        placeholder="Year" 
                        value={filters.year} 
                        onChange={(e)=> setFilters(prev=>({...prev, year: e.target.value}))}
                        className="w-[100px]"
                    />

                    <Select value={filters.status} onValueChange={(v)=> setFilters(prev=>({...prev, status: v}))}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
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

                    <Button onClick={() => fetchPayrolls(1)} variant="default" className="bg-[#10B5DB] hover:bg-[#0e9ab9]">
                        Filter View
                    </Button>
                    
                    <div className="flex items-center gap-1 border-l pl-3 ml-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleExportExcel} 
                            title="Export to Excel"
                            className="h-10 w-10 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 border-green-200"
                        >
                            <FileSpreadsheet className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handlePrintReport} 
                            title="Print PDF Report"
                             className="h-10 w-10 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200"
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No payroll records found for the selected criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Agent Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map(p => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">
                        <div>{p.agent?.agentName || `${p.agent?.firstName || ''} ${p.agent?.lastName || ''}`}</div>
                        <div className="text-xs text-muted-foreground">{p.agent?.role?.name || 'Agent'}</div>
                      </TableCell>
                      <TableCell>{getMonthName(p.month)} {p.year}</TableCell>
                      <TableCell>{(p.financials?.grossSalary ?? p.grossSalary)?.toLocaleString()}</TableCell>
                      <TableCell className="text-red-500">{(p.financials?.totalDeduction ?? p.totalDeduction)?.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">{(p.financials?.netSalary ?? p.netSalary)?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'paid' ? 'success' : p.status === 'unpaid' ? 'destructive' : 'secondary'} className="capitalize">
                            {p.status}
                        </Badge>
                        {p.paymentDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(p.paymentDate).toLocaleDateString()}</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={()=> openPayslip(p)} disabled={p.status !== 'paid'}>View Slip</Button>
                          {canPay && (
                             <Button 
                                size="sm" 
                                variant={p.status === 'paid' ? "secondary" : "default"}
                                onClick={()=> togglePaid(p)}
                             >
                                {p.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                             </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {payrolls.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
