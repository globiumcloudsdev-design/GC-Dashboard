"use client";

import {
  Home,
  Settings,
  Users,
  LogOut,
  Menu,
  Phone,
  CalendarDays,
  User,
  Code2Icon,
  TrendingUp,
  Bell,
  Clock,
  DollarSign,
  ClipboardList,
  X,
  UsersRound,
  FolderKanban,
  Book,
  Mail,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Pre-defined menu structure for better organization
const MENU_SECTIONS = [
  {
    title: "General",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: TrendingUp,
        permission: { module: "analytics", action: "view" },
      },
    ],
  },
  {
    title: "CRM & Management",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        permission: { module: "user", action: "view" },
      },
      {
        label: "Employees",
        href: "/dashboard/agents",
        icon: User,
        permission: { module: "agent", action: "view" },
      },
      {
        label: "Teams",
        href: "/dashboard/teams",
        icon: UsersRound,
        permission: { module: "team", action: "view" },
      },
      {
        label: "Contacts",
        href: "/dashboard/contacts",
        icon: Phone,
        permission: { module: "contact", action: "view" },
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Bookings",
        href: "/dashboard/bookings",
        icon: CalendarDays,
        permission: { module: "booking", action: "view" },
      },
      {
        label: "Shift Panel",
        href: "/dashboard/shift-pannel",
        icon: Clock,
        permission: { module: "shift", action: "view" },
      },
      {
        label: "Attendance",
        href: "/dashboard/view-attendance",
        icon: ClipboardList,
        permission: { module: "attendance", action: "view" },
      },
      {
        label: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
        permission: { module: "project", action: "view" },
      },
    ],
  },
  {
    title: "Financials",
    items: [
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: DollarSign,
        permission: { module: "sales", action: "view" },
      },
      {
        label: "Payroll",
        href: "/dashboard/payroll",
        icon: ClipboardList,
        permission: { module: "payroll", action: "view" },
      },
      {
        label: "Promo Codes",
        href: "/dashboard/promo-codes",
        icon: Code2Icon,
        permission: { module: "promoCode", action: "view" },
      },
    ],
  },
  {
    title: "Marketing & Content",
    items: [
      {
        label: "Blogs",
        href: "/dashboard/blogs",
        icon: Book,
        permission: { module: "blog", action: "view" },
      },
      {
        label: "News Letter",
        href: "/dashboard/news-letter",
        icon: UsersRound,
        permission: { module: "newsletter", action: "view" },
      },
      {
        label: "Campaigns",
        href: "/dashboard/campaigns",
        icon: Mail,
        permission: { module: "newsletter", action: "view" },
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permission: { module: "notification", action: "view" },
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        permission: { module: "settings", action: "view" },
      },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  const { user, loading: authLoading, hasPermission, logout } = useAuth();

  // Optimized permission filtering - wait for auth to load
  const allowedSections = useMemo(() => {
    if (authLoading) return []; // Don't render until auth is ready
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true;
        if (!user) return false;
        return hasPermission(
          item.permission.module,
          item.permission.action || "view",
        );
      }),
    })).filter((section) => section.items.length > 0);
  }, [user, authLoading, hasPermission]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout?.();
      window.location.href = "/login";
    }
  };

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenMobile(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile
            ? openMobile
              ? "280px"
              : "0px"
            : collapsed
              ? "80px"
              : "280px",
          x: isMobile && !openMobile ? "-280px" : "0px",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed z-[70] flex flex-col h-screen border-r shadow-2xl transition-colors duration-300",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-slate-800/50",
          "lg:left-0 lg:top-0",
          !openMobile && isMobile && "invisible lg:visible",
        )}
      >
        {/* Header / Logo Section */}
        <div
          className={cn(
            "shrink-0 border-b border-gray-200/50 dark:border-slate-800/50 transition-all",
            collapsed
              ? "h-28 flex flex-col items-center justify-center gap-2 px-2 py-3"
              : "h-24 flex items-center px-6",
          )}
        >
          {collapsed ? (
            // Collapsed: logo centered + expand button below
            <>
              <Link href="/dashboard">
                <Image
                  src="/images/GCLogo.png"
                  alt="GC Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 w-8 h-8"
              >
                <Menu size={16} className="text-slate-500" />
              </Button>
            </>
          ) : (
            // Expanded: logo left + toggle right
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 overflow-hidden"
              >
                <Image
                  src="/images/GCLogo.png"
                  alt="GC Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">
                    GC Panel
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#10B5DB] font-bold mt-1">
                    Dashboard
                  </span>
                </motion.div>
              </Link>

              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                  className="ml-auto rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(true)}
                  className="ml-auto rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Menu size={18} className="text-slate-500" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Search / Contextual Info can go here if needed, keeping it clean for now */}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar px-4 space-y-8">
          {authLoading ? (
            // Skeleton loading while auth is being checked
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((g) => (
                <div key={g} className="space-y-2">
                  {!collapsed && (
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-4 mb-3" />
                  )}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn(
                      "rounded-xl px-4 py-3 flex items-center gap-3",
                      collapsed && "justify-center"
                    )}>
                      <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded shrink-0" />
                      {!collapsed && <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            allowedSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
              {!collapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                >
                  {section.title}
                </motion.h3>
              )}

              <div className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Tooltip key={iIdx} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={() => isMobile && setOpenMobile(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold group transition-all duration-300 relative",
                            isActive
                              ? "bg-gradient-to-r from-[#10B5DB]/10 to-blue-500/5 text-[#10B5DB] dark:from-[#10B5DB]/20 dark:to-transparent"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-pill"
                              className="absolute left-0 w-1 h-6 bg-[#10B5DB] rounded-r-full shadow-[0_0_10px_#10B5DB]"
                            />
                          )}

                          <item.icon
                            size={20}
                            className={cn(
                              "shrink-0 transition-transform duration-300 group-hover:scale-110",
                              isActive
                                ? "text-[#10B5DB]"
                                : "text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-200",
                            )}
                          />

                          {!collapsed && (
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                          )}

                          {!collapsed && isActive && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <ChevronRight size={14} className="opacity-40" />
                            </motion.div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent
                          side="right"
                          sideOffset={20}
                          className="bg-slate-900 text-white border-none shadow-xl"
                        >
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-800/50 space-y-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl py-6 transition-all duration-300",
              "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
              collapsed ? "justify-center px-0" : "justify-start px-4",
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-bold">Sign Out</span>}
          </Button>

          {/* Minimal User Info when not collapsed */}
          {!collapsed && (
            <div className="mt-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-[#10B5DB] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {user?.firstName?.charAt(0) || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-medium">
                  {user?.role?.name || "Administrator"}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Toggle Button */}
      {isMobile && !openMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-[80] lg:hidden shadow-xl bg-[#10B5DB] text-white border-none hover:bg-[#0e9ab9]"
          onClick={() => setOpenMobile(true)}
        >
          <Menu size={20} />
        </Button>
      )}
    </TooltipProvider>
  );
}
