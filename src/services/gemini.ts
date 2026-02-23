import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface VideoSummary {
    oneLiner: string;
    popularFactor: string[];
}

export async function getAISummary(title: string, description: string): Promise<VideoSummary | null> {
    try {
        if (!API_KEY) {
            console.warn("Gemini API Key is missing.");
            return null;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            다음 유튜브 영상의 제목과 설명을 기반으로 트렌드 분석을 수행해줘.
            
            영상 제목: ${title}
            영상 설명: ${description}
            
            요구사항:
            1. 시청자들의 관심을 끌 수 있는 직관적이고 감각적인 한 줄 요약을 작성해줘.
            2. 이 영상이 현재 인기 있는 구체적인 이유(인기 비결)를 3가지 문장으로 분석해줘.
            
            JSON 응답 형식:
            {
                "oneLiner": "한 줄 요약 내용",
                "popularFactor": ["인기 비결 1", "인기 비결 2", "인기 비결 3"]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const data = JSON.parse(text);
            return data as VideoSummary;
        } catch (e) {
            console.error("JSON parsing failed, attempting fallback extraction:", e);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as VideoSummary;
            }
            return null;
        }
    } catch (error) {
        console.error("Gemini AI Summary Analysis failed:", error);
        return null;
    }
}
