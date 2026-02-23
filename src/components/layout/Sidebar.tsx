"use client";

import { motion } from "framer-motion";
import {
    Home,
    TrendingUp,
    Users,
    Settings,
    Youtube,
    LogOut,
    HelpCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const menuItems = [
        { id: "home", label: "홈", icon: Home },
        { id: "trends", label: "트렌드 리포트", icon: TrendingUp },
        { id: "insights", label: "시청자 분석", icon: Users },
        { id: "settings", label: "설정", icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-72 glass border-r border-border h-screen sticky top-0 z-20">
            {/* Brand Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-xl shadow-brand/30">
                    <Youtube className="text-white w-7 h-7" />
                </div>
                <div>
                    <span className="font-black text-xl leading-none block text-gradient tracking-tight">Trend-Lens</span>
                    <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mt-1 block tracking-widest">Analytics</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-10 space-y-2">
                <p className="px-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4 opacity-50">Menu</p>

                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group",
                            activeTab === item.id
                                ? "text-brand bg-brand/5 shadow-inner border border-brand/5"
                                : "text-muted hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 w-1 h-6 bg-brand rounded-r-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-300",
                            activeTab === item.id ? "scale-110 text-brand" : "group-hover:scale-110"
                        )} />
                        <span className={cn(
                            "font-bold text-sm tracking-tight transition-colors duration-300",
                            activeTab === item.id ? "text-brand" : ""
                        )}>
                            {item.label}
                        </span>
                    </button>
                ))}

                <div className="pt-10">
                    <p className="px-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4 opacity-50">Support</p>
                    <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-muted hover:bg-white/5 hover:text-foreground transition-all duration-300 group">
                        <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm tracking-tight">도움말</span>
                    </button>
                </div>
            </nav>

            {/* Footer / Logout */}
            <div className="p-6 mt-auto">
                <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-muted hover:text-brand hover:bg-brand/5 transition-all duration-300 group border border-transparent hover:border-brand/10">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">로그아웃</span>
                </button>
            </div>
        </aside>
    );
}
