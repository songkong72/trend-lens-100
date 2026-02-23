"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpRight,
    TrendingUp,
    Settings,
    Shield,
    Bell,
    Youtube,
    Search,
    Eye,
    MessageSquare,
    PlayCircle,
    ChevronRight,
    Filter,
    AlertCircle,
    Sparkles,
    ArrowLeft,
} from "lucide-react";
import { getAISummary, VideoSummary } from "@/services/gemini";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, Tooltip as RechartsTooltip,
    Rectangle
} from 'recharts';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTrendingVideos, getVideoDetails, type YouTubeVideo } from "@/services/youtube";
import { predictAudience, predictAudienceWithAI, type Demographics } from "@/services/analysis";
import { getHotKeywords, type HotKeyword } from "@/services/trends";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 헬퍼: 조회수 포맷팅 (예: 1240000 -> 124만회)
function formatViewCount(views: string | number) {
    const num = Number(views);
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '억회';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만회';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + '천회';
    }
    return num.toLocaleString() + '회';
}

// 헬퍼: 상대 시간 포맷팅 (예: 2024-01-01 -> 2 hours ago)
function formatRelativeTime(dateString: string) {
    const now = new Date();
    const published = new Date(dateString);
    const diffInMs = now.getTime() - published.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    return published.toLocaleDateString();
}

// 1. 홈 (Home): 대시보드 요약 정보
export function HomeView({ onSelectVideo }: { onSelectVideo: (id: string) => void }) {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVideos() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getTrendingVideos("KR", 10);
                if (data.length === 0) {
                    setError("데이터를 불러올 수 없습니다.");
                } else {
                    setVideos(data.slice(0, 5));
                    // 실시간 키워드 추출 (비동기)
                    getHotKeywords(data.slice(0, 30)).then(setHotKeywords);
                }
            } catch (err) {
                console.error(err);
                setError("데이터를 불러올 수 없습니다.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchVideos();
    }, []);

    const stats = [
        { label: "실시간 인기 영상", value: "100", unit: "개", icon: PlayCircle, color: "text-brand" },
        { label: "활성 키워드", value: "1,240", unit: "개", icon: Search, color: "text-accent" },
        { label: "총 조회수 추이", value: "3.2B", unit: "+12%", icon: Eye, color: "text-green-500" },
        { label: "평균 소통 지수", value: "85", unit: "/100", icon: MessageSquare, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">Overview</h1>
                    <p className="text-muted text-base max-w-xl leading-relaxed font-medium">
                        오늘의 유튜브 트렌드를 한눈에 확인하세요. 최신 영상 통계와 인기 키워드 요약 정보를 제공합니다.
                    </p>
                </div>
            </div>

            {/* 대시보드 메트릭 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-[2rem] p-8 border-white/5 relative group hover:border-brand/30 transition-all duration-500"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                                <ArrowUpRight className="w-3 h-3" />
                                LIVE
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 opacity-60">{stat.label}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black tracking-tighter">{stat.value}</span>
                            <span className="text-sm font-bold text-muted">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-brand" />
                            실시간 Hot 100 미리보기
                        </h3>
                        <button className="text-xs font-black text-muted hover:text-brand transition-colors uppercase tracking-widest">전체보기 +</button>
                    </div>
                    <div className="space-y-4">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-6 p-4 rounded-[1.5rem] bg-white/2">
                                    <div className="w-8 h-8 bg-white/10 rounded" />
                                    <div className="w-24 h-14 bg-white/10 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/10 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted gap-4">
                                <AlertCircle className="w-12 h-12 text-brand/40" />
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        ) : (
                            videos.map((video, i) => (
                                <div
                                    key={video.id}
                                    onClick={() => onSelectVideo(video.id)}
                                    className="flex items-center gap-6 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all group/item border border-transparent hover:border-white/5 cursor-pointer"
                                >
                                    <span className="w-8 text-2xl font-black text-white/20 italic group-hover/item:text-brand transition-colors">0{i + 1}</span>
                                    <div className="w-24 h-14 bg-white/5 rounded-xl flex-shrink-0 relative overflow-hidden text-[0]">
                                        <Image
                                            src={video.thumbnail}
                                            alt={video.title}
                                            fill
                                            className="object-cover group-hover/item:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate mb-1 group-hover:text-brand transition-colors">{video.title}</p>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-tight">
                                            {video.channelTitle} • {formatViewCount(video.viewCount)} views • {formatRelativeTime(video.publishedAt)}
                                        </p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black group-hover/item:border-brand/30 transition-colors">REPT 100</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass rounded-[3rem] p-10 border-white/5 relative group">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Search className="w-6 h-6 text-accent" />
                            급상승 검색어
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {hotKeywords.length > 0 ? (
                            hotKeywords.map((kw, i) => (
                                <div key={i} className="flex items-center justify-between group/kw">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-white/20 group-hover/kw:bg-brand transition-colors" />
                                        <span className="font-bold text-sm text-white group-hover/kw:text-brand transition-colors">{kw.term}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-green-500">{kw.growth}</span>
                                </div>
                            ))
                        ) : (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="h-6 w-full bg-white/5 rounded-lg animate-pulse" />
                            ))
                        )}
                    </div>
                    <div className="mt-12 p-6 rounded-[2rem] bg-accent/5 border border-accent/10">
                        <p className="text-[11px] text-accent font-black uppercase tracking-widest mb-2">AI INSIGHT</p>
                        <p className="text-xs text-muted leading-relaxed font-medium">
                            {hotKeywords[0]
                                ? `현재 '${hotKeywords[0].term}' 키워드가 인기 급상승 영상들 사이에서 가장 높은 비중을 차지하고 있습니다.`
                                : "인기 영상 데이터를 분석하여 실시간 화제 키워드를 추출하고 있습니다."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. 트렌드 리포트 (Trends): 인기 영상 100 + 검색어 순위 상세
export function TrendsView({ onSelectVideo }: { onSelectVideo: (id: string) => void }) {
    const [activeSubTab, setActiveSubTab] = useState("popular100");
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVideos() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getTrendingVideos("KR", 100);
                if (data.length === 0) {
                    setError("데이터를 불러올 수 없습니다.");
                } else {
                    setVideos(data);
                    // 실시간 키워드 추출
                    getHotKeywords(data.slice(0, 30)).then(setHotKeywords);
                }
            } catch (err) {
                console.error(err);
                setError("데이터를 불러올 수 없습니다.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchVideos();
    }, [activeSubTab]);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">Trend Report</h1>
                    <p className="text-muted text-base max-w-xl leading-relaxed font-medium">실시간 인기 동향과 검색 트렌드를 심층 분석하여 제공합니다.</p>
                </div>

                {/* 서브 탭 스위처 */}
                <div className="flex p-1.5 glass rounded-2xl border-white/5 bg-white/5 self-start">
                    <button
                        onClick={() => setActiveSubTab("popular100")}
                        className={cn(
                            "px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                            activeSubTab === "popular100" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted hover:bg-white/5"
                        )}
                    >
                        실시간 인기 Top 100
                    </button>
                    <button
                        onClick={() => setActiveSubTab("keywords")}
                        className={cn(
                            "px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                            activeSubTab === "keywords" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted hover:bg-white/5"
                        )}
                    >
                        급상승 검색어
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeSubTab === "popular100" ? (
                    <motion.div
                        key="popular100"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between glass p-6 rounded-[2rem] border-white/5 opacity-80">
                            <div className="flex items-center gap-4 text-xs font-black text-muted uppercase tracking-[0.2em]">
                                <Filter className="w-4 h-4 text-brand" />
                                <span>필터: 모든 카테고리</span>
                            </div>
                            <p className="text-xs text-muted font-bold">마지막 업데이트: 2분 전</p>
                        </div>

                        <div className="glass rounded-[3rem] border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/2">
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em] w-20">순위</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">영상 정보</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">조회수</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">업로드</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">액정</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoading ? (
                                            [...Array(10)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-8 py-6"><div className="h-8 bg-white/10 rounded w-8" /></td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-32 aspect-video bg-white/10 rounded-xl" />
                                                            <div className="flex-1 space-y-2">
                                                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                                                <div className="h-3 bg-white/10 rounded w-1/2" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6"><div className="h-4 bg-white/10 rounded w-16" /></td>
                                                    <td className="px-8 py-6"><div className="h-4 bg-white/10 rounded w-20" /></td>
                                                    <td className="px-8 py-6"><div className="h-8 bg-white/10 rounded w-24 ml-auto" /></td>
                                                </tr>
                                            ))
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-muted">
                                                        <AlertCircle className="w-12 h-12 text-brand/40" />
                                                        <p className="font-bold">{error}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            videos.map((video, i) => (
                                                <tr key={video.id} className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <span className={cn(
                                                            "text-2xl font-black italic",
                                                            i < 3 ? "text-brand" : "text-white/20"
                                                        )}>{i + 1}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-6 min-w-[300px]">
                                                            <div className="w-32 aspect-video bg-white/5 rounded-xl overflow-hidden flex-shrink-0 relative text-[0]">
                                                                <Image
                                                                    src={video.thumbnail}
                                                                    alt={video.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm mb-1 group-hover:text-brand transition-colors line-clamp-1">{video.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center text-[8px] font-black text-brand">YT</div>
                                                                    <span className="text-xs text-muted font-medium">{video.channelTitle}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-4 h-4 text-muted" />
                                                            <span className="text-sm font-black tracking-tight">{formatViewCount(video.viewCount)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs text-muted font-bold whitespace-nowrap">{formatRelativeTime(video.publishedAt)}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => onSelectVideo(video.id)}
                                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-brand/40 hover:text-brand transition-all"
                                                        >
                                                            분석 보기
                                                            <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-10 text-center border-t border-white/5 bg-white/2">
                                <p className="text-xs text-muted font-bold">100위까지의 모든 데이터를 확인하려면 아래로 스크롤하세요.</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="keywords"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 gap-10"
                    >
                        <div className="glass rounded-[3rem] border-white/5 overflow-hidden">
                            <div className="p-10 border-b border-white/5 bg-white/2 flex justify-between items-center">
                                <h3 className="text-2xl font-black tracking-tight">급상승 검색어 상세 분석</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        LIVE TRACKING
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/2">
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em] w-20">순위</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">키워드</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">검색량 추이</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">변동폭</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">관련 영상</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">상세</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {hotKeywords.length > 0 ? (
                                            hotKeywords.map((data, i) => (
                                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <span className="text-xl font-black text-white/40">{i + 1}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div>
                                                            <p className="font-bold text-base group-hover:text-brand transition-colors cursor-pointer">{data.term}</p>
                                                            <p className="text-[10px] text-muted font-medium mt-1 line-clamp-1 group-hover:text-white/60 transition-colors">{data.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-end gap-1 h-8 w-32">
                                                            {data.trend.map((h, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex-1 bg-brand/20 rounded-t-sm group-hover:bg-brand/40 transition-colors"
                                                                    style={{ height: `${h}%` }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-1.5 text-green-400 font-bold">
                                                            <ArrowUpRight className="w-4 h-4" />
                                                            <span className="text-sm">{data.growth}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs text-muted font-bold">AI 분석 완료</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-muted hover:border-brand/40 hover:text-brand transition-all">
                                                            <Search className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            [...Array(8)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-8 py-6"><div className="h-6 w-8 bg-white/10 rounded" /></td>
                                                    <td className="px-8 py-6"><div className="h-6 w-48 bg-white/10 rounded" /></td>
                                                    <td className="px-8 py-6"><div className="h-8 w-32 bg-white/10 rounded" /></td>
                                                    <td className="px-8 py-6"><div className="h-6 w-16 bg-white/10 rounded" /></td>
                                                    <td className="px-8 py-6"><div className="h-6 w-24 bg-white/10 rounded" /></td>
                                                    <td className="px-8 py-6"><div className="h-10 w-10 bg-white/10 rounded ml-auto" /></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 3. 시청자 분석 (Insights): 채널별 성별/연령별 통계
export function InsightsView({ videoId, setVideoId }: { videoId: string | null; setVideoId: (id: string | null) => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [video, setVideo] = useState<YouTubeVideo | null>(null);
    const [demographics, setDemographics] = useState<Demographics | null>(null);
    const [aiSummary, setAiSummary] = useState<VideoSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (videoId) {
            fetchAnalysis(videoId);
        } else {
            setVideo(null);
            setDemographics(null);
            setAiSummary(null);
            setSearchQuery("");
        }
    }, [videoId]);

    async function fetchAnalysis(id: string) {
        try {
            setIsLoading(true);
            setAiSummary(null);
            const videoData = await getVideoDetails(id);
            if (videoData) {
                setVideo(videoData);

                // 처음엔 기본 로직으로 바로 보여줌
                const basePrediction = predictAudience(videoData.categoryId || "0");
                setDemographics(basePrediction);

                // AI 요약 비동기 호출
                setIsAiLoading(true);
                getAISummary(videoData.title, videoData.description || "").then(summary => {
                    setAiSummary(summary);
                });

                // AI 시청자 분석 비동기 호출 (정확도 향상)
                predictAudienceWithAI(videoData.title, videoData.description || "", videoData.categoryId || "0").then(aiDemographics => {
                    setDemographics(aiDemographics);
                    setIsAiLoading(false);
                });
            }
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const genderData = demographics?.gender || [
        { name: '남성', value: 52, color: '#3B82F6' },
        { name: '여성', value: 48, color: '#FF4B2B' },
    ];

    const ageData = demographics?.age || [
        { name: '10대', value: 15 },
        { name: '20대', value: 35 },
        { name: '30대', value: 25 },
        { name: '40대', value: 12 },
        { name: '50대', value: 8 },
        { name: '60대+', value: 5 },
    ];

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-gradient">Audience Insights</h1>
                    <p className="text-muted text-base max-w-xl leading-relaxed font-medium">유튜브 인기 영상의 카테고리 기법을 분석하여 시청자 통계 및 인구통계학적 데이터를 예측합니다.</p>
                </div>

                {/* 대형 검색바 */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-brand/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 -z-10" />
                    <div className="glass rounded-[2.5rem] p-4 flex items-center border-brand/20 group-focus-within:border-brand/50 transition-all duration-500">
                        <div className="p-5 rounded-3xl bg-brand/10 border border-brand/20 mr-6">
                            <Search className="w-8 h-8 text-brand" />
                        </div>
                        <input
                            type="text"
                            placeholder="분석할 유튜브 영상 ID 또는 채널명을 입력하세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-2xl font-black placeholder:text-muted/30 focus:ring-0"
                        />
                        <button
                            onClick={() => {
                                if (searchQuery) setVideoId(searchQuery);
                            }}
                            className="px-10 py-5 bg-brand text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            분석 시작
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="glass rounded-[3rem] p-24 flex flex-col items-center justify-center gap-6 border-white/5">
                    <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    <p className="text-xl font-black text-muted animate-pulse font-mono tracking-widest uppercase">Analyzing Data...</p>
                </div>
            ) : video ? (
                <>
                    {/* 뒤로가기 버튼 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <button
                            onClick={() => setVideoId(null)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-brand/50 hover:text-brand transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            목록으로 돌아가기
                        </button>
                    </motion.div>

                    {/* 선택된 채널 기본 정보 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-[3rem] p-10 border-white/5 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-r from-card to-transparent"
                    >
                        <div className="w-32 h-32 rounded-[2.5rem] bg-brand/10 border-2 border-brand/20 p-2 flex-shrink-0 relative overflow-hidden">
                            <Image
                                src={video.thumbnail}
                                alt={video.title}
                                fill
                                className="object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-brand/20 mix-blend-overlay" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <h3 className="text-2xl font-black tracking-tight line-clamp-1">{video.title}</h3>
                                <span className="px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black text-brand uppercase tracking-widest self-center md:self-auto">
                                    {demographics?.categoryName}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">채널명</p>
                                    <p className="text-xl font-black">{video.channelTitle}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">조회수</p>
                                    <p className="text-xl font-black">{formatViewCount(video.viewCount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">분석 정확도</p>
                                    <p className="text-xl font-black text-green-500">98.2%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* AI 트렌드 분석 요약 섹션 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-accent/20 to-brand/20 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 -z-10 animate-gradient-x" />
                        <div className="glass rounded-[3rem] p-10 border-brand/20 relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20">
                                    <Sparkles className="w-8 h-8 text-brand animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-gradient">AI 트렌드 분석 요약</h3>
                                    <p className="text-xs text-muted font-medium">Gemini 1.5 Flash가 분석한 실시간 인사이트</p>
                                </div>
                            </div>

                            {isAiLoading ? (
                                <div className="space-y-6">
                                    <div className="h-10 w-full bg-white/5 rounded-2xl animate-pulse relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-8 w-24 bg-white/5 rounded-full animate-pulse relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : aiSummary ? (
                                <div className="space-y-8">
                                    <p className="text-3xl font-black leading-tight tracking-tight">
                                        &quot;{aiSummary.oneLiner}&quot;
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {aiSummary.popularFactor.map((factor, idx) => (
                                            <div
                                                key={idx}
                                                className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 group/tag hover:border-brand/50 transition-all cursor-default"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                                                <span className="text-sm font-black text-muted group-hover/tag:text-white transition-colors uppercase tracking-widest">{factor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted font-medium">분석 데이터를 불러오는 중 오류가 발생했습니다.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* 분포 분석 레이아웃 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* 왼쪽: 성별 분포 (Donut Chart) */}
                        <div className="glass rounded-[3rem] p-12 border-white/5 flex flex-col items-center relative overflow-hidden group">
                            <div className="flex justify-between items-center w-full mb-8">
                                <h3 className="text-2xl font-black tracking-tight">Gender Distribution</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                                    <ArrowUpRight className="w-3 h-3" />
                                    AI 통계 시뮬레이션
                                </div>
                            </div>

                            <div className="relative w-full h-72 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-1">성별 비중</p>
                                    <p className="text-4xl font-black tracking-tighter">
                                        {genderData[0].value}:{genderData[1].value}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-12 w-full justify-center">
                                {genderData.map((entry) => (
                                    <div key={entry.name} className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm font-bold text-muted">{entry.name} ({entry.value}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 오른쪽: 연령대별 접속자 (Bar Chart) */}
                        <div className="glass rounded-[3rem] p-12 border-white/5 relative overflow-hidden group">
                            <div className="flex justify-between items-center w-full mb-8">
                                <h3 className="text-2xl font-black tracking-tight">Age Demographics</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black text-brand bg-brand/10 px-3 py-1.5 rounded-xl border border-brand/20">
                                    <ArrowUpRight className="w-3 h-3" />
                                    타겟층 분석 완료
                                </div>
                            </div>

                            <div className="w-full h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}
                                            dy={10}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white text-black px-3 py-2 rounded-xl shadow-2xl text-[10px] font-black">
                                                            {payload[0].value}%
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#ff4b2b"
                                            radius={[10, 10, 10, 10]}
                                            activeBar={<Rectangle fill="#FF0000" stroke="none" />}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1.5 font-mono">Statistical Insight</p>
                                <p className="text-xs text-muted leading-relaxed font-medium">카테고리 &apos;{demographics?.categoryName}&apos;의 평균 시청 데이터를 기반으로 성별 및 연령대 분포를 산출했습니다.</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass rounded-[3rem] p-32 flex flex-col items-center justify-center text-center space-y-8 border-white/5">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10">
                        <TrendingUp className="w-10 h-10 text-brand opacity-40" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black tracking-tight">분석할 영상이 선택되지 않았습니다.</h3>
                        <p className="text-muted text-base max-w-md mx-auto font-medium">실시간 인기 영상 리스트에서 &apos;분석 보기&apos;를 클릭하거나, 검색창에 영상 ID를 입력해 주세요.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// 4. 설정 (Settings): PWA 설정 및 데이터 관리
export function SettingsView() {
    return (
        <div className="space-y-10">
            <div className="max-w-3xl">
                <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">Settings</h1>
                <p className="text-muted text-base font-medium leading-relaxed">시스템 환경 및 PWA 서비스 설정을 구성합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-[2.5rem] p-10 border-white/5 space-y-8">
                    <h3 className="text-xl font-black flex items-center gap-3">
                        <Settings className="w-5 h-5 text-brand" /> 서비스 관리
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: "PWA 오프라인 캐싱", desc: "네트워크 끊김 시에도 분석 데이터를 제공합니다.", value: "사용함", icon: Shield },
                            { label: "데이터 갱신 주기", desc: "유튜브 API로부터 데이터를 동기화하는 간격입니다.", value: "60분마다", icon: TrendingUp },
                            { label: "알림 푸시 서비스", desc: "주요 트렌드 포착 시 즉시 알림을 발송합니다.", value: "활성", icon: Bell },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-full">
                                        <p className="text-sm font-bold group-hover:text-brand transition-colors">{item.label}</p>
                                        <p className="text-[10px] text-muted">{item.desc}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-brand bg-brand/10 px-3 py-1 rounded-lg flex-shrink-0 ml-4">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-[2.5rem] p-10 border-brand/20 bg-brand/5 relative flex flex-col justify-center items-center text-center space-y-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Youtube className="w-40 h-40" /></div>
                    <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center shadow-2xl shadow-brand/40 relative z-10">
                        <Youtube className="w-10 h-10 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2">Premium Member</h3>
                        <p className="text-sm text-muted font-medium mb-8">모든 고급 분석 기능과 API 한계치 상향을 누리고 계십니다.</p>
                        <button className="px-10 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/30 hover:scale-105 transition-transform">구독 관리</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
