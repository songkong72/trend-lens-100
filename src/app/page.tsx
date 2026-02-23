"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { HomeView, TrendsView, InsightsView, SettingsView } from "@/components/dashboard/Views";
import {
  Home as HomeIcon,
  TrendingUp,
  Users,
  Settings
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const tabs = [
    { id: "home", label: "홈", icon: HomeIcon },
    { id: "trends", label: "트렌드", icon: TrendingUp },
    { id: "insights", label: "분석", icon: Users },
    { id: "settings", label: "설정", icon: Settings },
  ];

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setActiveTab("insights");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-8 md:p-12 lg:p-16 max-w-[1600px] mx-auto pb-32 md:pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.02 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                {activeTab === "home" && <HomeView onSelectVideo={handleSelectVideo} />}
                {activeTab === "trends" && <TrendsView onSelectVideo={handleSelectVideo} />}
                {activeTab === "insights" && (
                  <InsightsView
                    videoId={selectedVideoId}
                    onSearch={() => setSelectedVideoId(null)}
                  />
                )}
                {activeTab === "settings" && <SettingsView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-24 glass border-t border-white/5 flex items-center justify-around px-8 z-50 backdrop-blur-3xl pb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all duration-500 relative",
              activeTab === tab.id ? "text-brand" : "text-muted"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-mobile-tab-indicator"
                className="absolute -top-3 w-10 h-1 bg-brand rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn(
              "p-2 rounded-xl transition-all duration-500",
              activeTab === tab.id ? "bg-brand/10 scale-110" : "scale-100"
            )}>
              <tab.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight leading-none">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
