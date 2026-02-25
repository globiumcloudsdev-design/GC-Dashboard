"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAgent } from "../context/AgentContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock,
  DollarSign,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Layers,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

const AGENT_MENU = [
  {
    title: "Performance",
    items: [
      { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
      { label: "Attendance", href: "/agent/attendance", icon: Clock },
    ],
  },
  {
    title: "Financials",
    items: [
      { label: "Sales Data", href: "/agent/sales", icon: BarChart3 },
      { label: "Earnings", href: "/agent/salary", icon: Wallet },
      {
        label: "Upload Sales",
        href: "/agent/projects",
        icon: Layers,
        requiresRevenue: true,
      },
    ],
  },
  {
    title: "Preferences",
    items: [{ label: "Settings", href: "/agent/settings", icon: Settings }],
  },
];

export default function AgentSidebar({
  isOpen,
  setIsOpen,
  collapsed,
  setCollapsed,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, agent } = useAgent();
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  const handleLogout = async () => {
    if (confirm("Logout from Agent Panel?")) {
      await logout();
      router.push("/agent/login");
    }
  };

  const allowedSections = useMemo(() => {
    return AGENT_MENU.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiresRevenue) {
          return (
            agent?.monthlyTargetType === "amount" ||
            agent?.monthlyTargetType === "both"
          );
        }
        return true;
      }),
    })).filter((section) => section.items.length > 0);
  }, [agent]);

  // Filter navItems based on agent's target type
  const navItems = baseNavItems.filter(item => {
    if (item.requiresRevenue) {
      // Show only if agent has revenue target (amount or both)
      return agent?.monthlyTargetType === 'amount' || agent?.monthlyTargetType === 'both';
    }
    return true;
  });

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        {/* Guarding mobile overlay */}
        <AnimatePresence>
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Aside Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: isMobile
              ? isOpen
                ? "280px"
                : "0px"
              : collapsed
                ? "80px"
                : "300px",
            x: isMobile && !isOpen ? "-280px" : "0px",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "fixed z-[70] flex flex-col h-screen shadow-2xl transition-all duration-300",
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50",
            "lg:left-0 lg:top-0",
            !isOpen && isMobile && "invisible lg:visible",
          )}
        >
          {/* Logo Section */}
          <div className="h-24 flex items-center px-6 shrink-0 border-b border-slate-200/50 dark:border-slate-800/50">
            <Link
              href="/agent/dashboard"
              className="flex items-center gap-3 overflow-hidden"
            >
              <Image
                src="/images/GCLogo.png"
                alt="GC Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg text-slate-900 dark:text-white leading-none tracking-tight">
                    Agent Portal
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#10B5DB] font-bold mt-1">
                    Globium Clouds
                  </span>
                </motion.div>
              )}
            </Link>

            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="ml-auto rounded-full"
              >
                <X size={20} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "ml-auto rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
                  collapsed && "hidden",
                )}
              >
                <Menu size={18} className="text-slate-500" />
              </Button>
            )}
          </div>

          {/* Navigation Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar px-4 space-y-8">
            {allowedSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
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
                            onClick={() => isMobile && setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold group transition-all duration-300 relative",
                              isActive
                                ? "bg-gradient-to-r from-[#10B5DB]/10 to-transparent text-[#10B5DB] dark:text-[#10B5DB]"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-pill-agent"
                                className="absolute left-0 w-1 h-6 bg-[#10B5DB] rounded-r-full shadow-[0_0_10px_#10B5DB]"
                              />
                            )}

                            <item.icon
                              size={20}
                              className={cn(
                                "shrink-0 transition-transform duration-300 group-hover:scale-110",
                                isActive
                                  ? "text-[#10B5DB]"
                                  : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200",
                              )}
                            />

                            {!collapsed && (
                              <span className="flex-1 truncate">
                                {item.label}
                              </span>
                            )}

                            {!collapsed && isActive && (
                              <ChevronRight size={14} className="opacity-40" />
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
            ))}
          </div>

          {/* User Profile Card */}
          {!collapsed && (
            <div className="mx-4 mb-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-[#10B5DB] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {agent?.agentName?.charAt(0) || <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {agent?.agentName || "Agent"}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-medium">
                  {agent?.agentId || "ID: N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Footer Sign out */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
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
          </div>
        </motion.aside>

        {/* Mobile Toggle Button */}
        {isMobile && !isOpen && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-[80] lg:hidden shadow-xl bg-[#10B5DB] text-white border-none hover:bg-[#0e9ab9]"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={20} />
          </Button>
        )}

        {/* Desktop Collapse Toggle (Visible only when sidebar is collapsed) */}
        {!isMobile && collapsed && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-[80] shadow-lg border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur hover:scale-105 transition-all"
            onClick={() => setCollapsed(false)}
          >
            <Menu size={20} />
          </Button>
        )}

        {/* Content Wrapper */}
        <main
          className={cn(
            "transition-all duration-300 min-h-screen",
            isMobile
              ? isOpen
                ? "blur-sm pointer-events-none"
                : "pt-20 px-4 pb-4"
              : collapsed
                ? "ml-20 pt-20 px-8 pb-8"
                : "ml-[300px] pt-20 px-8 pb-4",
          )}
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
