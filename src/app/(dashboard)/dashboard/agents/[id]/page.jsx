"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { agentService } from '@/services/agentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  Building, 
  DollarSign, 
  Clock, 
  Briefcase,
  Target,
  TrendingUp,
  Award,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // State for sub-sections
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State for different sales data types
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  
  const [payrolls, setPayrolls] = useState([]);
  const [payrollsLoading, setPayrollsLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalSales: 0,
    achievedDigits: 0,
    attendanceRate: 0,
    performance: 0
  });

  // Month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
  }));

  const years = [2024, 2025, 2026, 2027];

  useEffect(() => {
    fetchAgentDetails();
    // Fetch initial data for stats (Current Month)
    fetchAttendance(true); 
    if (agent?.monthlyTargetType === 'digit') {
      fetchBookings(true);
    } else if (agent?.monthlyTargetType === 'amount') {
      fetchProjects(true);
    } else if (agent?.monthlyTargetType === 'both') {
      fetchSalesData(true);
    }
  }, [id, agent?.monthlyTargetType]);

  useEffect(() => {
    if (activeTab === 'attendance') fetchAttendance();
    if (activeTab === 'sales') {
      if (agent?.monthlyTargetType === 'digit') {
        fetchBookings();
      } else if (agent?.monthlyTargetType === 'amount') {
        fetchProjects();
      } else if (agent?.monthlyTargetType === 'both') {
        fetchSalesData();
      }
    }
    if (activeTab === 'payroll') fetchPayrolls();
  }, [activeTab, selectedMonth, selectedYear, agent?.monthlyTargetType]);

  async function fetchAgentDetails() {
    setLoading(true);
    try {
      // Direct API call kar rahe hain to ensure proper data
      const response = await fetch(`/api/agents/${id}`);
      const data = await response.json();
      
      if (data.success && data.agent) {
        setAgent(data.agent);
        console.log("Agent data loaded:", data.agent);
      } else {
        toast.error(data.error || 'Failed to load agent details');
      }
    } catch (error) {
      console.error("Agent fetch error:", error);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendance(isInitial = false) {
    if (!isInitial) setAttendanceLoading(true);
    try {
      const targetMonth = isInitial ? new Date().getMonth() + 1 : selectedMonth;
      const targetYear = isInitial ? new Date().getFullYear() : selectedYear;
      
      console.log(`Fetching attendance for agent: ${id}, month: ${targetMonth}, year: ${targetYear}`);
      
      // Use direct API call
      const res = await fetch(`/api/attendance?agentId=${id}&month=${targetMonth}&year=${targetYear}`);
      const json = await res.json();
      
      console.log("Attendance response:", json);
      
      if (json.success) {
        const attendanceData = json.data || [];
        if (!isInitial) setAttendance(attendanceData);
        
        // Calculate Attendance Rate
        const totalDays = attendanceData.length;
        const presentDays = attendanceData.filter(d => 
          d.status === 'present' || d.status === 'late'
        ).length;
        const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        if (isInitial || (targetMonth === new Date().getMonth() + 1 && targetYear === new Date().getFullYear())) {
           setStats(prev => ({ ...prev, attendanceRate: rate }));
        }
      } else {
        toast.error(json.message || 'Failed to load attendance');
      }
    } catch (error) {
      console.error("Attendance fetch error:", error);
      if (!isInitial) toast.error('Failed to load attendance');
    } finally {
      if (!isInitial) setAttendanceLoading(false);
    }
  }

  async function fetchBookings(isInitial = false) {
    if (!isInitial) setBookingsLoading(true);
    try {
       const targetMonth = isInitial ? new Date().getMonth() + 1 : selectedMonth;
       const targetYear = isInitial ? new Date().getFullYear() : selectedYear;

       const start = new Date(targetYear, targetMonth - 1, 1).toISOString();
       const end = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();
       
       console.log(`Fetching bookings for agent: ${id}, start: ${start}, end: ${end}`);
       
       // Direct API call
       const res = await fetch(`/api/promo-codes/agent/${id}/bookings?startDate=${start}&endDate=${end}&limit=1000`);
       const json = await res.json();
       
       console.log("Bookings response:", json);
       
       if (json.success) {
         const bookingData = json.data?.bookings || json.data || [];
         if (!isInitial) setBookings(bookingData);

         // Calculate Total Sales for digit target
         const completedBookings = bookingData.filter(b => 
           b.status === 'completed' || b.status === 'confirmed' || b.status === 'Completed'
         );
         const total = completedBookings.reduce((sum, b) => 
           sum + (b.discountedPrice || b.totalPrice || b.amount || 0), 0
         );
         
         if (isInitial || (targetMonth === new Date().getMonth() + 1 && targetYear === new Date().getFullYear())) {
            setStats(prev => ({ ...prev, totalSales: total }));
         }
       } else {
         toast.error(json.message || 'Failed to load bookings');
       }
    } catch (error) {
       console.error("Bookings fetch error:", error);
       if (!isInitial) toast.error('Failed to load bookings');
    } finally {
       if (!isInitial) setBookingsLoading(false);
    }
    }

  async function fetchProjects(isInitial = false) {
    if (!isInitial) setProjectsLoading(true);
    try {
       const targetMonth = isInitial ? new Date().getMonth() + 1 : selectedMonth;
       const targetYear = isInitial ? new Date().getFullYear() : selectedYear;

       const start = new Date(targetYear, targetMonth - 1, 1).toISOString();
       const end = new Date(targetYear, targetMonth, 0).toISOString();
       
       console.log(`Fetching projects for agent: ${id}, start: ${start}, end: ${end}`);
       
       // Fetch projects assigned to this agent
       const res = await fetch(`/api/projects?assignedAgent=${id}&startDate=${start}&endDate=${end}&limit=1000`);
       const json = await res.json();
       
       console.log("Projects response:", json);
       
       if (json.success) {
         const projectData = json.data || [];
         if (!isInitial) setProjects(projectData);

         // Calculate Total Revenue from Projects
         const total = projectData
            .filter(p => p.status === 'Completed' || p.status === 'Delivered')
            .reduce((sum, p) => sum + (p.price || 0), 0);
         
         if (isInitial || (targetMonth === new Date().getMonth() + 1 && targetYear === new Date().getFullYear())) {
            setStats(prev => ({ ...prev, totalSales: total }));
         }
       } else {
         toast.error(json.message || 'Failed to load projects');
       }
    } catch (error) {
       console.error("Projects fetch error:", error);
       if (!isInitial) toast.error('Failed to load projects');
    } finally {
       if (!isInitial) setProjectsLoading(false);
    }
  }

  async function fetchSalesData(isInitial = false) {
    if (!isInitial) setSalesLoading(true);
    try {
       const targetMonth = isInitial ? new Date().getMonth() + 1 : selectedMonth;
       const targetYear = isInitial ? new Date().getFullYear() : selectedYear;

       const start = new Date(targetYear, targetMonth - 1, 1);
       const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);
       
       console.log(`Fetching combined sales data for agent: ${id}, month: ${targetMonth}, year: ${targetYear}`);
       
       // Fetch bookings with date filter
       const bookingsRes = await fetch(`/api/promo-codes/agent/${id}/bookings?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=1000`);
       
       // Fetch ALL projects for agent (we'll filter by date on frontend)
       const projectsRes = await fetch(`/api/projects?assignedAgent=${id}&limit=1000`);
       
       const bookingsJson = await bookingsRes.json();
       const projectsJson = await projectsRes.json();
       
       console.log("Combined sales response:", { bookingsJson, projectsJson });
       
       if (bookingsJson.success && projectsJson.success) {
         const bookingData = bookingsJson.data?.bookings || bookingsJson.data || [];
         let projectDataAll = projectsJson.data || [];
         
         // Filter projects by selected month using updatedAt or completedAt
         const projectData = projectDataAll.filter(p => {
           const relevantDate = p.completedAt ? new Date(p.completedAt) : new Date(p.updatedAt);
           return relevantDate >= start && relevantDate <= end;
         });
         
         console.log(`Projects filtered for ${targetMonth}/${targetYear}: ${projectData.length} out of ${projectDataAll.length}`);
         
         // Combine and sort by date
         const combinedData = [
           ...bookingData.map(b => ({ 
             ...b, 
             type: 'booking', 
             date: b.createdAt,
             amount: b.discountedPrice || b.totalPrice || b.amount || 0
           })),
           ...projectData.map(p => ({ 
             ...p, 
             type: 'project', 
             date: p.completedAt || p.updatedAt || p.createdAt,
             amount: p.price || 0
           }))
         ].sort((a, b) => new Date(b.date) - new Date(a.date));
         
         if (!isInitial) setSalesData(combinedData);

         // Calculate Total Sales and Digits based on agent's target type
         const agentTargetType = agent?.monthlyTargetType || 'none';
         
         let totalSales = 0;
         let achievedDigits = 0;
         
         if (agentTargetType === 'digit') {
           // For digit target: count completed bookings, sum their amounts for display
           const completedBookings = bookingData.filter(b => 
             b.status === 'completed' || b.status === 'confirmed' || b.status === 'Completed'
           );
           achievedDigits = completedBookings.length;
           totalSales = completedBookings.reduce((sum, b) => 
             sum + (b.discountedPrice || b.totalPrice || b.amount || 0), 0
           );
         } else if (agentTargetType === 'amount') {
           // For amount target: sum from completed projects only
           const completedProjects = projectData.filter(p => 
             p.status === 'Completed' || p.status === 'Delivered'
           );
           totalSales = completedProjects.reduce((sum, p) => 
             sum + (p.price || 0), 0
           );
         } else if (agentTargetType === 'both') {
           // For both target: digits from bookings, revenue from projects only
           const completedBookings = bookingData.filter(b => 
             b.status === 'completed' || b.status === 'confirmed' || b.status === 'Completed'
           );
           achievedDigits = completedBookings.length;
           
           const completedProjects = projectData.filter(p => 
             p.status === 'Completed' || p.status === 'Delivered'
           );
           totalSales = completedProjects.reduce((sum, p) => 
             sum + (p.price || 0), 0
           );
         } else {
           // Default: sum both bookings and projects
           const completedBookings = bookingData.filter(b => 
             b.status === 'completed' || b.status === 'confirmed' || b.status === 'Completed'
           );
           const totalBookings = completedBookings.reduce((sum, b) => 
             sum + (b.discountedPrice || b.totalPrice || b.amount || 0), 0
           );
           
           const completedProjects = projectData.filter(p => 
             p.status === 'Completed' || p.status === 'Delivered'
           );
           const totalProjects = completedProjects.reduce((sum, p) => 
             sum + (p.price || 0), 0
           );
           
           totalSales = totalBookings + totalProjects;
         }
         
         console.log(`📊 Stats calculated - Digits: ${achievedDigits}, Revenue: ${totalSales}`);
         
         if (isInitial || (targetMonth === new Date().getMonth() + 1 && targetYear === new Date().getFullYear())) {
            setStats(prev => ({ ...prev, totalSales, achievedDigits }));
         }
       } else {
         toast.error('Failed to load sales data');
       }
    } catch (error) {
       console.error("Sales data fetch error:", error);
       if (!isInitial) toast.error('Failed to load sales data');
    } finally {
       if (!isInitial) setSalesLoading(false);
    }
  }

  async function fetchPayrolls() {
     setPayrollsLoading(true);
     try {
       console.log(`Fetching payroll for agent: ${id}`);
       
       // Direct API call
       const res = await fetch(`/api/payroll?agent=${id}&limit=50`);
       const json = await res.json();
       
       console.log("Payroll response:", json);
       
       if (json.success) {
         setPayrolls(json.data || []);
       } else {
         toast.error(json.message || 'Failed to load payroll history');
       }
     } catch (error) {
        console.error("Payroll fetch error:", error);
        toast.error('Failed to load payroll history');
     } finally {
        setPayrollsLoading(false);
     }
  }

  // --- Export Functions ---

  const downloadCSV = (data, fileName) => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }
    
    // Ensure data is properly formatted
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle nested objects and dates
        if (value instanceof Date) {
          return `"${format(value, 'yyyy-MM-dd')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('File downloaded successfully');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg font-medium text-gray-600">Loading Agent Profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Agent Not Found</h2>
          <p className="text-gray-500 mb-6">The agent you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    let currencySymbol = agent?.targetCurrency || 'PKR';
    
    if (agent?.monthlyTargetType === 'digit') {
      currencySymbol = 'USD'; // Will be formatted as $ by custom logic or Intl
    }
    
    // Simple formatting if we just want symbol
    if (currencySymbol === 'USD') return `$${amount?.toLocaleString() || '0'}`;
    if (currencySymbol === 'EUR') return `€${amount?.toLocaleString() || '0'}`;
    if (currencySymbol === 'GBP') return `£${amount?.toLocaleString() || '0'}`;
    
    return `${currencySymbol} ${amount?.toLocaleString('en-PK') || '0'}`;
  };

  // Helper function to get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      present: 'bg-green-100 text-green-800 border-green-200',
      late: 'bg-orange-100 text-orange-800 border-orange-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      half_day: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved_leave: 'bg-blue-100 text-blue-800 border-blue-200',
      holiday: 'bg-purple-100 text-purple-800 border-purple-200',
      weekly_off: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      pending_leave: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                              {agent.agentName || 'Unknown Agent'}
                            </h1>
                            <Badge className={agent.isActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                                {agent.isActive ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                                ) : (
                                    <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                                )}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <Badge variant="outline" className="font-mono text-xs bg-slate-50 border-slate-300">
                              {agent.agentId || 'N/A'}
                            </Badge>
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                                {agent.designation || 'Sales Agent'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5">
                                <Building className="h-3.5 w-3.5 text-blue-500" />
                                {agent.employeeType || 'Permanent'}
                            </span>
                            {agent.shift && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                                    {agent.shift.name} ({agent.shift.startTime} - {agent.shift.endTime})
                                </span>
                              </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2 hover:bg-slate-100">
                             <FileText className="h-4 w-4" /> Generate Letter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Select Letter Type</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/offer`)}>
                            Offer Letter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/appointment`)}>
                            Appointment Letter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/confirmation`)}>
                            Confirmation Letter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/increment`)}>
                            Increment Letter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/experience`)}>
                            Experience Letter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${id}/letters/relieving`)} className="text-red-600 focus:text-red-700">
                            Relieving Letter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>

                     <Button onClick={handlePrint} variant="outline" className="gap-2 hover:bg-slate-100">
                        <Printer className="h-4 w-4" /> Print
                     </Button>
                </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="absolute top-0 right-0 opacity-10">
                    <DollarSign className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardDescription className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
                      Total Sales (This Month)
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold mt-2">
                        {formatCurrency(stats.totalSales)}
                    </CardTitle>
                </CardHeader>
             </Card>
             
             <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="absolute top-0 right-0 opacity-10">
                    <Target className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardDescription className="text-purple-100 text-xs font-semibold uppercase tracking-wider">
                      Monthly Target
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold mt-2">
                      {agent.monthlyTargetType === 'digit' && agent.monthlyDigitTarget ? (
                           <span>{agent.monthlyDigitTarget} <span className="text-base font-normal opacity-80">Sales</span></span>
                      ) : agent.monthlyTargetType === 'amount' && agent.monthlyAmountTarget ? (
                           <span className="text-2xl">
                             <span className="text-base font-normal opacity-80 mr-1">{agent.targetCurrency || 'PKR'}</span>
                             {(agent.monthlyAmountTarget || 0).toLocaleString()}
                           </span>
                      ) : agent.monthlyTargetType === 'both' ? (
                          <span className="text-xl">
                            {agent.monthlyDigitTarget || 0} / {agent.targetCurrency || 'PKR'} {(agent.monthlyAmountTarget || 0).toLocaleString()}
                          </span>
                      ) : (
                          <span className="text-2xl opacity-70">No Target</span>
                      )}
                    </CardTitle>
                </CardHeader>
             </Card>
             
             <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="absolute top-0 right-0 opacity-10">
                    <TrendingUp className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardDescription className="text-green-100 text-xs font-semibold uppercase tracking-wider">
                      Attendance Rate
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold mt-2">
                      {stats.attendanceRate}%
                    </CardTitle>
                    <p className="text-xs opacity-80 mt-1">
                      {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                    </p>
                </CardHeader>
             </Card>
             
             <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="absolute top-0 right-0 opacity-10">
                    <Calendar className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardDescription className="text-orange-100 text-xs font-semibold uppercase tracking-wider">
                      Next Payroll
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold mt-2">
                      {new Date().toLocaleString('default', { month: 'long' })} 10
                    </CardTitle>
                    <p className="text-xs opacity-80 mt-1">Salary Processing Date</p>
                </CardHeader>
             </Card>
        </div>

        {/* Performance Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Monthly Performance</h3>
            <Badge variant="outline" className="font-mono">
              {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
            </Badge>
          </div>
          
          {(() => {
            let progress = 0;
            let progressText = '';
            let targetText = '';
            
            if (agent?.monthlyTargetType === 'digit') {
              const completedBookings = stats.achievedDigits || 0;
              const target = agent.monthlyDigitTarget || 0;
              progress = target > 0 ? Math.min((completedBookings / target) * 100, 100) : 0;
              progressText = `${completedBookings} / ${target} Sales`;
              targetText = `Target: ${target} Sales`;
            } else if (agent?.monthlyTargetType === 'amount') {
              const target = agent.monthlyAmountTarget || 0;
              progress = target > 0 ? Math.min((stats.totalSales / target) * 100, 100) : 0;
              progressText = `${agent.targetCurrency || 'PKR'} ${stats.totalSales.toLocaleString()} / ${(agent.targetCurrency || 'PKR')} ${target.toLocaleString()}`;
              targetText = `Target: ${agent.targetCurrency || 'PKR'} ${target.toLocaleString()}`;
            } else if (agent?.monthlyTargetType === 'both') {
              const completedBookings = stats.achievedDigits || 0;
              const digitTarget = agent.monthlyDigitTarget || 0;
              const amountTarget = agent.monthlyAmountTarget || 0;
              const digitProgress = digitTarget > 0 ? (completedBookings / digitTarget) : 0;
              const amountProgress = amountTarget > 0 ? (stats.totalSales / amountTarget) : 0;
              progress = Math.min(((digitProgress + amountProgress) / 2) * 100, 100);
              progressText = `${completedBookings} Sales & ${agent.targetCurrency || 'PKR'} ${stats.totalSales.toLocaleString()}`;
              targetText = `Target: ${digitTarget} Sales & ${agent.targetCurrency || 'PKR'} ${amountTarget.toLocaleString()}`;
            }
            
            return (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{targetText}</span>
                  <span className="font-medium text-slate-900">{progressText}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-green-500' : 
                      progress >= 75 ? 'bg-blue-500' : 
                      progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>0%</span>
                  <span className="font-medium">{progress.toFixed(1)}% Complete</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* TABS */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="print:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <TabsList className="w-full justify-start bg-slate-50 rounded-lg h-auto p-1">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 font-medium">
                        <User className="h-4 w-4 mr-2" />
                        Complete Profile
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 font-medium">
                        <Clock className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 font-medium">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Sales History
                    </TabsTrigger>
                    <TabsTrigger value="payroll" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 font-medium">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payroll
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* TAB: OVERVIEW / COMPLETE PROFILE */}
            <TabsContent value="overview" className="mt-6 space-y-6">
                 {/* Section 1: Personal & Contact Information */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <User className="h-5 w-5" />
                             Personal & Contact Information
                         </h2>
                     </div>
                     <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                     <User className="h-3.5 w-3.5" />
                                     Full Name
                                 </label>
                                 <p className="text-base font-semibold text-slate-900">
                                   {agent.agentName || 'N/A'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                     <Mail className="h-3.5 w-3.5" />
                                     Email Address
                                 </label>
                                 <p className="text-base font-medium text-slate-900 truncate" title={agent.email}>
                                   {agent.email || 'N/A'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                     <Phone className="h-3.5 w-3.5" />
                                     Phone Number
                                 </label>
                                 <p className="text-base font-medium text-slate-900">
                                   {agent.phone || 'Not Provided'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Agent ID
                                 </label>
                                 <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                                   {agent.agentId || 'N/A'}
                                 </Badge>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Status
                                 </label>
                                 <div>
                                     <Badge className={agent.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                                         {agent.isActive ? 'Active' : 'Inactive'}
                                     </Badge>
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Joining Date
                                 </label>
                                 <p className="text-base font-medium text-slate-900">
                                   {agent.createdAt ? format(new Date(agent.createdAt), 'dd MMM yyyy') : 'N/A'}
                                 </p>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Section 2: Employment Details */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <Briefcase className="h-5 w-5" />
                             Employment Details
                         </h2>
                     </div>
                     <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Designation
                                 </label>
                                 <p className="text-base font-semibold text-slate-900">
                                   {agent.designation || 'Sales Agent'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Employee Type
                                 </label>
                                 <Badge variant="outline" className="font-normal bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                                     {agent.employeeType || 'Permanent'}
                                 </Badge>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                     <Clock className="h-3.5 w-3.5" />
                                     Shift Assigned
                                 </label>
                                 <p className="text-base font-medium text-slate-900">
                                   {agent.shift?.name || 'N/A'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Shift Timing
                                 </label>
                                 <p className="text-base font-medium text-slate-900">
                                   {agent.shift?.startTime || 'N/A'} - {agent.shift?.endTime || 'N/A'}
                                 </p>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Section 3: Salary & Compensation */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <DollarSign className="h-5 w-5" />
                             Salary & Compensation Structure
                         </h2>
                     </div>
                     <div className="p-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Commission Type
                                 </label>
                                 <p className="text-base font-semibold text-slate-900">
                                   {agent.commissionType || 'Basic + Commission'}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Basic Salary
                                 </label>
                                 <p className="text-lg font-bold text-green-600">
                                     {formatCurrency(agent.basicSalary)}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Attendance Allowance
                                 </label>
                                 <p className="text-lg font-bold text-green-600">
                                     {formatCurrency(agent.attendanceAllowance)}
                                 </p>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Total Base
                                 </label>
                                 <p className="text-lg font-bold text-slate-900">
                                     {formatCurrency((agent.basicSalary || 0) + (agent.attendanceAllowance || 0))}
                                 </p>
                             </div>
                         </div>

                         {/* Incentive Structure */}
                         <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                             <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                 <Award className="h-4 w-4 text-amber-500" />
                                 Incentive Structure
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-white rounded-lg p-4 border border-slate-200">
                                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                                       In-Target Incentive
                                     </label>
                                     <p className="text-xl font-bold text-blue-600">
                                         {(agent.perSaleIncentiveInTarget || 0)}
                                         {agent.inTargetIncentiveType === 'percentage' ? '%' : ' PKR'}
                                     </p>
                                     <p className="text-xs text-slate-500 mt-1">Per Sale (Before Target)</p>
                                 </div>
                                 <div className="bg-white rounded-lg p-4 border border-slate-200">
                                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                                       After-Target Incentive
                                     </label>
                                     <p className="text-xl font-bold text-purple-600">
                                         {(agent.perSaleIncentiveAfterTarget || 0)}
                                         {agent.afterTargetIncentiveType === 'percentage' ? '%' : ' PKR'}
                                     </p>
                                     <p className="text-xs text-slate-500 mt-1">Per Sale (After Target)</p>
                                 </div>
                             </div>
                             {(agent.minSaleAmountForIncentive > 0) && (
                                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                     <p className="text-xs font-medium text-amber-800">
                                         <span className="font-semibold">Minimum Sale for Incentive:</span> {formatCurrency(agent.minSaleAmountForIncentive)}
                                     </p>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Section 4: Target & Performance */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <Target className="h-5 w-5" />
                             Monthly Target Configuration
                         </h2>
                     </div>
                     <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                   Target Type
                                 </label>
                                 <Badge variant="outline" className="text-base font-semibold capitalize px-3 py-1.5">
                                     {agent.monthlyTargetType || 'none'}
                                 </Badge>
                             </div>
                             {(agent.monthlyTargetType === 'digit' || agent.monthlyTargetType === 'both') && (
                                 <div className="space-y-2">
                                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                       Digit Target
                                     </label>
                                     <p className="text-2xl font-bold text-orange-600">
                                       {agent.monthlyDigitTarget || 0} Sales
                                     </p>
                                 </div>
                             )}
                             {(agent.monthlyTargetType === 'amount' || agent.monthlyTargetType === 'both') && (
                                 <div className="space-y-2">
                                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                       Amount Target
                                     </label>
                                     <p className="text-2xl font-bold text-orange-600">
                                         {agent.targetCurrency || 'PKR'} {(agent.monthlyAmountTarget || 0).toLocaleString()}
                                     </p>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Section 5: Bank Details */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <Building className="h-5 w-5" />
                             Bank Account Information
                         </h2>
                     </div>
                     <div className="p-6">
                         {agent.bankDetails && (agent.bankDetails.bankName || agent.bankDetails.accountNumber) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Bank Name
                                    </label>
                                    <p className="text-base font-semibold text-slate-900">
                                      {agent.bankDetails.bankName || '-'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Account Title
                                    </label>
                                    <p className="text-base font-medium text-slate-900">
                                      {agent.bankDetails.accountTitle || '-'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Branch Code
                                    </label>
                                    <p className="text-base font-medium text-slate-900">
                                      {agent.bankDetails.branchCode || '-'}
                                    </p>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Account Number
                                    </label>
                                    <p className="font-mono text-base font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                       {agent.bankDetails.accountNumber || '-'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      IBAN
                                    </label>
                                    <p className="font-mono text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200 break-all">
                                       {agent.bankDetails.iban || '-'}
                                    </p>
                                </div>
                            </div>
                         ) : (
                            <div className="text-center py-12">
                                <Building className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 italic">No bank account details added yet.</p>
                            </div>
                         )}
                     </div>
                 </div>

                 {/* Section 6: Documents */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                             <FileText className="h-5 w-5" />
                             Uploaded Documents
                         </h2>
                     </div>
                     <div className="p-6">
                         {agent.documents && agent.documents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                               {agent.documents.map((doc, idx) => (
                                   <div key={idx} className="group flex items-center justify-between p-4 rounded-lg border-2 border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                       <div className="flex items-center gap-3 overflow-hidden flex-1">
                                           <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                               <FileText className="h-5 w-5" />
                                           </div>
                                           <div className="overflow-hidden flex-1">
                                               <p className="font-medium truncate text-slate-900 text-sm" title={doc.name}>
                                                 {doc.name}
                                               </p>
                                               <p className="text-xs text-slate-500 uppercase">
                                                 {doc.type ? doc.type.split('/')[1] : 'FILE'}
                                               </p>
                                           </div>
                                       </div>
                                       <Button 
                                         size="icon" 
                                         variant="ghost" 
                                         className="h-9 w-9 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
                                         asChild
                                       >
                                           <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                                               <Download className="h-4 w-4" />
                                           </a>
                                       </Button>
                                   </div>
                               ))}
                            </div>
                         ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 italic">No documents uploaded yet.</p>
                            </div>
                         )}
                     </div>
                 </div>
            </TabsContent>

             {/* TAB: ATTENDANCE */}
            <TabsContent value="attendance" className="mt-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl text-slate-800">Attendance History</CardTitle>
                            <CardDescription>View monthly attendance records and punctuality stats.</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                            <div className="bg-white rounded-md border flex items-center p-1 shadow-sm">
                                <Calendar className="h-4 w-4 ml-2 mr-1 text-slate-400" />
                                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                    <SelectTrigger className="w-[130px] border-0 h-8 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => (
                                          <SelectItem key={m.value} value={m.value.toString()}>
                                            {m.label}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                    <SelectTrigger className="w-[90px] border-0 h-8 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => (
                                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="h-10 bg-white" 
                               onClick={() => downloadCSV(
                                attendance.map(a => ({
                                    Date: a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
                                    Status: a.status?.toUpperCase() || 'ABSENT',
                                    CheckIn: a.checkInTime ? format(new Date(a.checkInTime), 'hh:mm a') : '-',
                                    CheckOut: a.checkOutTime ? format(new Date(a.checkOutTime), 'hh:mm a') : '-',
                                    LateMinutes: a.lateMinutes || 0
                                })),
                                `Attendance_${agent.agentName}_${selectedMonth}_${selectedYear}`
                               )}
                               disabled={attendance.length === 0}
                             >
                                <Download className="h-4 w-4 mr-2"/> Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="rounded-md border-0 m-0">
                         <Table>
                             <TableHeader className="bg-slate-50">
                                 <TableRow>
                                     <TableHead className="w-40">Date</TableHead>
                                     <TableHead>Status</TableHead>
                                     <TableHead>Check In</TableHead>
                                     <TableHead>Check Out</TableHead>
                                     <TableHead className="text-right">Late (Mins)</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {attendanceLoading ? (
                                     <TableRow>
                                       <TableCell colSpan={5} className="text-center h-40 text-slate-500">
                                         <div className="flex flex-col items-center justify-center gap-2">
                                             <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                             Loading records...
                                         </div>
                                       </TableCell>
                                     </TableRow>
                                 ) : attendance.length === 0 ? (
                                     <TableRow>
                                       <TableCell colSpan={5} className="text-center h-40 text-slate-500">
                                         No attendance records found for this month.
                                       </TableCell>
                                     </TableRow>
                                 ) : (
                                     attendance.map((rec) => (
                                         <TableRow key={rec._id || rec.date} className="hover:bg-slate-50/50">
                                             <TableCell className="font-medium text-slate-700">
                                               {rec.date ? format(new Date(rec.date), 'EEE, dd MMM yyyy') : '-'}
                                             </TableCell>
                                             <TableCell>
                                                 <Badge variant="secondary" className={getStatusBadge(rec.status)}>
                                                     {rec.status?.replace('_', ' ').toUpperCase()}
                                                 </Badge>
                                             </TableCell>
                                             <TableCell className="text-slate-600">
                                               {rec.checkInTime ? format(new Date(rec.checkInTime), 'hh:mm a') : '-'}
                                             </TableCell>
                                             <TableCell className="text-slate-600">
                                               {rec.checkOutTime ? format(new Date(rec.checkOutTime), 'hh:mm a') : '-'}
                                             </TableCell>
                                             <TableCell className={`text-right font-medium ${rec.lateMinutes > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                               {rec.lateMinutes || '-'}
                                             </TableCell>
                                         </TableRow>
                                     ))
                                 )}
                             </TableBody>
                         </Table>
                         </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB: SALES */}
            <TabsContent value="sales" className="mt-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl text-slate-800">
                              {agent?.monthlyTargetType === 'digit' ? 'Sales Bookings' : 
                               agent?.monthlyTargetType === 'amount' ? 'Revenue Projects' : 
                               'Sales & Revenue'}
                            </CardTitle>
                            <CardDescription>
                              {agent?.monthlyTargetType === 'digit' ? 'Track monthly booking performance and customer details.' :
                               agent?.monthlyTargetType === 'amount' ? 'Track monthly project revenue and completion status.' :
                               'Track monthly sales performance across bookings and projects.'}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                            <div className="bg-white rounded-md border flex items-center p-1 shadow-sm">
                                <Calendar className="h-4 w-4 ml-2 mr-1 text-slate-400" />
                                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                    <SelectTrigger className="w-[130px] border-0 h-8 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => (
                                          <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                    <SelectTrigger className="w-[90px] border-0 h-8 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => (
                                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 bg-white" 
                              onClick={() => {
                                let data = [];
                                if (agent?.monthlyTargetType === 'digit') {
                                  data = bookings.map(b => ({
                                    ID: b.bookingId || b._id,
                                    Customer: (b.formData?.firstName || '') + ' ' + (b.formData?.lastName || ''),
                                    Service: b.bookingType || b.serviceType || 'N/A',
                                    Amount: b.discountedPrice || b.totalPrice || 0,
                                    Status: b.status?.toUpperCase() || 'PENDING',
                                    Date: b.createdAt ? format(new Date(b.createdAt), 'dd MMM yyyy') : 'N/A'
                                  }));
                                } else if (agent?.monthlyTargetType === 'amount') {
                                  data = projects.map(p => ({
                                    ID: p.slug || p._id,
                                    Title: p.title,
                                    Client: p.client?.name || 'N/A',
                                    Amount: p.price || 0,
                                    Status: p.status?.toUpperCase() || 'PENDING',
                                    Date: p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy') : 'N/A'
                                  }));
                                } else if (agent?.monthlyTargetType === 'both') {
                                  data = salesData.map(item => ({
                                    Type: item.type.toUpperCase(),
                                    ID: item.type === 'booking' ? (item.bookingId || item._id) : (item.slug || item._id),
                                    Title: item.type === 'booking' ? 
                                      `${item.formData?.firstName || ''} ${item.formData?.lastName || ''}` : 
                                      item.title,
                                    Amount: item.type === 'booking' ? 
                                      (item.discountedPrice || item.totalPrice || 0) : 
                                      (item.price || 0),
                                    Status: item.status?.toUpperCase() || 'PENDING',
                                    Date: item.date ? format(new Date(item.date), 'dd MMM yyyy') : 'N/A'
                                  }));
                                }
                                downloadCSV(data, `Sales_${agent.agentName}_${selectedMonth}_${selectedYear}`);
                              }}
                              disabled={
                                (agent?.monthlyTargetType === 'digit' && bookings.length === 0) ||
                                (agent?.monthlyTargetType === 'amount' && projects.length === 0) ||
                                (agent?.monthlyTargetType === 'both' && salesData.length === 0)
                              }
                            >
                                <Download className="h-4 w-4 mr-2"/> Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="rounded-md border-0 m-0">
                         <Table>
                             <TableHeader className="bg-slate-50">
                                 <TableRow>
                                     <TableHead className="w-[120px]">
                                       {agent?.monthlyTargetType === 'digit' ? 'Booking ID' : 
                                        agent?.monthlyTargetType === 'amount' ? 'Project ID' : 'ID'}
                                     </TableHead>
                                     <TableHead>Date</TableHead>
                                     <TableHead>
                                       {agent?.monthlyTargetType === 'digit' ? 'Customer' : 
                                        agent?.monthlyTargetType === 'amount' ? 'Project Title' : 'Title'}
                                     </TableHead>
                                     <TableHead className="text-right">Amount ({agent?.targetCurrency || 'PKR'})</TableHead>
                                     <TableHead className="text-right">Status</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {(() => {
                                   let isLoading = false;
                                   let data = [];
                                   let noDataText = '';
                                   
                                   if (agent?.monthlyTargetType === 'digit') {
                                     isLoading = bookingsLoading;
                                     data = bookings;
                                     noDataText = 'No bookings found for this month.';
                                   } else if (agent?.monthlyTargetType === 'amount') {
                                     isLoading = projectsLoading;
                                     data = projects;
                                     noDataText = 'No projects found for this month.';
                                   } else if (agent?.monthlyTargetType === 'both') {
                                     isLoading = salesLoading;
                                     data = salesData;
                                     noDataText = 'No sales data found for this month.';
                                   }
                                   
                                   if (isLoading) {
                                     return (
                                       <TableRow>
                                         <TableCell colSpan={5} className="text-center h-40 text-slate-500">
                                           <div className="flex flex-col items-center justify-center gap-2">
                                               <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                               Loading sales data...
                                           </div>
                                         </TableCell>
                                       </TableRow>
                                     );
                                   }
                                   
                                   if (data.length === 0) {
                                     return (
                                       <TableRow>
                                         <TableCell colSpan={5} className="text-center h-40 text-slate-500">
                                           {noDataText}
                                         </TableCell>
                                       </TableRow>
                                     );
                                   }
                                   
                                   return data.map((item) => (
                                       <TableRow key={item._id} className="hover:bg-slate-50/50">
                                           <TableCell className="font-mono text-xs font-medium text-slate-600 bg-slate-50/50 w-min whitespace-nowrap">
                                             {agent?.monthlyTargetType === 'digit' ? 
                                               (item.bookingId || item._id?.slice(-6)) :
                                               agent?.monthlyTargetType === 'amount' ? 
                                               (item.slug || item._id?.slice(-6)) :
                                               (item.type === 'booking' ? (item.bookingId || item._id?.slice(-6)) : (item.slug || item._id?.slice(-6)))
                                             }
                                           </TableCell>
                                           <TableCell className="text-slate-600">
                                             {(() => {
                                               let dateValue;
                                               if (agent?.monthlyTargetType === 'digit') {
                                                 dateValue = item.createdAt || item.date;
                                               } else if (agent?.monthlyTargetType === 'amount') {
                                                 dateValue = item.createdAt || item.date;
                                               } else {
                                                 dateValue = item.date || item.createdAt;
                                               }
                                               return dateValue ? format(new Date(dateValue), 'dd MMM yyyy') : 'N/A';
                                             })()}
                                           </TableCell>
                                           <TableCell className="font-medium text-slate-800">
                                             {agent?.monthlyTargetType === 'digit' ? 
                                               `${item.formData?.firstName} ${item.formData?.lastName}` :
                                               agent?.monthlyTargetType === 'amount' ? 
                                               item.title :
                                               (item.type === 'booking' ? 
                                                 `${item.formData?.firstName || ''} ${item.formData?.lastName || ''}` : 
                                                 item.title)
                                             }
                                           </TableCell>
                                           <TableCell className="text-right font-medium text-slate-700">
                                             {agent?.monthlyTargetType === 'digit' ? 
                                               ((item.discountedPrice || item.totalPrice) || 0).toLocaleString() :
                                               agent?.monthlyTargetType === 'amount' ? 
                                               (item.price || 0).toLocaleString() :
                                               (item.type === 'booking' ? 
                                                 ((item.discountedPrice || item.totalPrice) || 0).toLocaleString() : 
                                                 (item.price || 0).toLocaleString())
                                             }
                                           </TableCell>
                                           <TableCell className="text-right">
                                               <Badge variant="secondary" className={
                                                   item.status === 'completed' || item.status === 'confirmed' || item.status === 'Completed' || item.status === 'Delivered' ? 
                                                   'bg-green-100 text-green-700 border-green-200' :
                                                   item.status === 'cancelled' || item.status === 'Cancelled' ? 
                                                   'bg-red-50 text-red-700 border-red-200' :
                                                   'bg-blue-50 text-blue-700 border-blue-200'
                                               }>
                                                   {item.status?.toUpperCase() || 'PENDING'}
                                               </Badge>
                                           </TableCell>
                                       </TableRow>
                                   ));
                                 })()}
                             </TableBody>
                         </Table>
                         </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB: PAYROLL */}
            <TabsContent value="payroll" className="mt-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-slate-50/50 pb-4">
                         <div className="space-y-1">
                             <CardTitle className="text-xl text-slate-800">Payroll History</CardTitle>
                             <CardDescription>View past salary slips and payment status.</CardDescription>
                         </div>
                         <div className="print:hidden">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 bg-white" 
                              onClick={() => downloadCSV(
                                payrolls.map(p => ({
                                    Month: `${p.month || 'N/A'}/${p.year || 'N/A'}`,
                                    Basic: p.financials?.basicSalary || 0,
                                    TotalEarnings: p.financials?.grossSalary || 0,
                                    TotalDeductions: p.financials?.totalDeduction || 0,
                                    NetPay: p.financials?.netSalary || 0,
                                    Status: p.status?.toUpperCase() || 'PENDING'
                                })),
                                `Payroll_${agent.agentName}`
                              )}
                              disabled={payrolls.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2"/> Export CSV
                            </Button>
                         </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="rounded-md border-0 m-0">
                         <Table>
                             <TableHeader className="bg-slate-50">
                                 <TableRow>
                                     <TableHead>Period</TableHead>
                                     <TableHead>Basic Salary</TableHead>
                                     <TableHead>Gross Earning</TableHead>
                                     <TableHead className="text-red-600">Deductions</TableHead>
                                     <TableHead>Net Pay</TableHead>
                                     <TableHead>Status</TableHead>
                                     <TableHead className="text-right">Action</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {payrollsLoading ? (
                                    <TableRow>
                                      <TableCell colSpan={7} className="text-center h-40 text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                             <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                             Loading payroll history...
                                         </div>
                                      </TableCell>
                                    </TableRow>
                                 ) : payrolls.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={7} className="text-center h-40 text-slate-500">
                                        No payroll records found.
                                      </TableCell>
                                    </TableRow>
                                 ) : (
                                    payrolls.map((payroll) => (
                                        <TableRow key={payroll._id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-700">
                                              {payroll.month ? new Date(2000, payroll.month - 1).toLocaleString('default', {month:'long'}) : 'N/A'} {payroll.year}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                              {formatCurrency(payroll.financials?.basicSalary)}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                              {formatCurrency(payroll.financials?.grossSalary)}
                                            </TableCell>
                                            <TableCell className="text-red-500 font-medium">
                                              {formatCurrency(payroll.financials?.totalDeduction)}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-900 bg-slate-50/50">
                                              {formatCurrency(payroll.financials?.netSalary)}
                                            </TableCell>
                                            <TableCell>
                                                 <Badge className={
                                                   payroll.status === 'paid' ? 
                                                   'bg-green-100 text-green-800 border-green-200' : 
                                                   payroll.status === 'pending' ?
                                                   'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                   'bg-gray-100 text-gray-800 border-gray-200'
                                                 }>
                                                     {payroll.status?.toUpperCase() || 'PENDING'}
                                                 </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <Button 
                                                   size="sm" 
                                                   variant="ghost" 
                                                   className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                   onClick={() => router.push(`/dashboard/payroll/payslip/${payroll._id}`)}
                                                 >
                                                     View Slip
                                                 </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                 )}
                             </TableBody>
                         </Table>
                         </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}