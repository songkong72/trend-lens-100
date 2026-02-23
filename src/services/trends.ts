import { GoogleGenerativeAI } from "@google/generative-ai";
import { YouTubeVideo } from "./youtube";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface HotKeyword {
    term: string;
    growth: string;
    description: string;
    trend: number[];
}

export async function getHotKeywords(videos: YouTubeVideo[]): Promise<HotKeyword[]> {
    if (!API_KEY || videos.length === 0) return [];

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const titles = videos.map(v => v.title).join("\n");
        const prompt = `
            다음은 현재 유튜브 인기 급상승 영상들의 제목 리스트이다.
            이 리스트를 분석하여 현재 가장 화제가 되고 있는 핵심 키워드(인물, 브랜드, 사건, 유행어 등) 5개를 선정해줘.
            
            영상 리스트:
            ${titles}
            
            각 키워드에 대해 다음 정보를 포함한 JSON 배열을 반환해줘:
            1. term: 키워드 이름 (예: "뉴진스", "ChatGPT")
            2. growth: 예상 상승률 (예: "+150%")
            3. description: 왜 이 키워드가 뜨고 있는지에 대한 1문장 설명
            4. trend: 6개의 숫자로 이루어진 더미 트렌드 데이터 (0~100 사이, 최근으로 갈수록 높아지게)
            
            응답 형식:
            [
                { "term": "키워드", "growth": "+00%", "description": "설명", "trend": [10, 20, 30, 40, 50, 60] }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const data = JSON.parse(text);
            return data as HotKeyword[];
        } catch (e) {
            console.error("Failed to parse keywords JSON", e);
            return [];
        }
    } catch (error) {
        console.error("Failed to fetch hot keywords from Gemini:", error);
        return [];
    }
}
