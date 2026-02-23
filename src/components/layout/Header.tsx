"use client";

import {
    Bell,
    User,
    Search,
    LayoutDashboard,
    Globe,
    Youtube
} from "lucide-react";

interface HeaderProps {
    activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
    const getTitle = () => {
        switch (activeTab) {
            case 'home': return '홈 / 대시보드';
            case 'trends': return '트렌드 리포트';
            case 'insights': return '시청자 분석 통계';
            case 'settings': return '시스템 설정';
            default: return 'Trend-Lens';
        }
    };

    return (
        <header className="h-24 flex items-center justify-between px-10 glass border-b border-white/5 sticky top-0 z-30 backdrop-blur-2xl">
            {/* Mobile Brand */}
            <div className="md:hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                    <Youtube className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gradient">Trend-Lens</span>
            </div>

            {/* Desktop breadcrumb & Title */}
            <div className="hidden md:block">
                <div className="flex items-center gap-2 text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Trend-Lens 100</span>
                    <span className="text-white/20">/</span>
                    <span className="text-brand uppercase">{activeTab}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-gradient">
                    {getTitle()}
                </h2>
            </div>

            {/* Search Bar - Center */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-10">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-brand transition-colors" />
                    <input
                        type="text"
                        placeholder="영 제목, 채널명, 키워드로 트렌드 검색..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all placeholder:text-muted/50 font-medium"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-white/10 pr-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <Globe className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">KOREA (LIVE)</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brand/60 uppercase tracking-tighter leading-none mb-1">Last Update</span>
                        <span className="text-[10px] font-black text-muted/60 leading-none">20:12:30</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-3 rounded-2xl hover:bg-white/5 transition-all text-muted relative glass border-white/10 group">
                        <Bell className="w-5 h-5 group-hover:shake transition-transform" />
                        <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-brand rounded-full ring-4 ring-background animate-pulse"></span>
                    </button>

                    <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                        <div className="text-right hidden xl:block">
                            <p className="text-sm font-black leading-none group-hover:text-brand transition-colors">관리자 계정</p>
                            <p className="text-[10px] text-muted font-bold uppercase mt-1.5 tracking-tighter opacity-70">Premium Plan</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-0.5 border border-white/10 group-hover:border-brand/30 transition-all shadow-xl">
                            <div className="w-full h-full rounded-[0.9rem] bg-card flex items-center justify-center overflow-hidden">
                                <User className="text-muted w-6 h-6 group-hover:text-brand transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
