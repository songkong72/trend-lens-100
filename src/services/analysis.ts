/**
 * 지능형 통계 예측 알고리즘 (Intelligent Statistical Prediction Algorithm)
 * 타 채널의 시청자 데이터를 직접 가져올 수 없는 한계를 극복하기 위해
 * 영상 카테고리 기반으로 인구통계 분포를 예측 시뮬레이션합니다.
 */

export interface Demographics {
    gender: { name: string; value: number; color: string }[];
    age: { name: string; value: number }[];
    categoryName: string;
}

// 유튜브 카테고리 ID 매핑 (주요 카테고리 중심)
const CATEGORY_MAP: Record<string, string> = {
    '1': 'Film & Animation',
    '2': 'Autos & Vehicles',
    '10': 'Music',
    '15': 'Pets & Animals',
    '17': 'Sports',
    '18': 'Short Movies',
    '19': 'Travel & Events',
    '20': 'Gaming',
    '22': 'People & Blogs',
    '23': 'Comedy',
    '24': 'Entertainment',
    '25': 'News & Politics',
    '26': 'Howto & Style', // Beauty/Fashion
    '27': 'Education',
    '28': 'Science & Technology',
    '29': 'Nonprofits & Activism',
};

export function getCategoryName(categoryId: string): string {
    return CATEGORY_MAP[categoryId] || 'Unknown';
}

export function predictAudience(categoryId: string): Demographics {
    const categoryName = getCategoryName(categoryId);

    let gender = [
        { name: '남성', value: 50, color: '#3B82F6' },
        { name: '여성', value: 50, color: '#FF4B2B' },
    ];

    let age = [
        { name: '10대', value: 15 },
        { name: '20대', value: 25 },
        { name: '30대', value: 25 },
        { name: '40대', value: 15 },
        { name: '50대', value: 12 },
        { name: '60대+', value: 8 },
    ];

    // 가중치 적용 로직 (Simulation)
    switch (categoryId) {
        case '20': // Gaming (게임)
            gender = [
                { name: '남성', value: 78, color: '#3B82F6' },
                { name: '여성', value: 22, color: '#FF4B2B' },
            ];
            age = [
                { name: '10대', value: 35 },
                { name: '20대', value: 40 },
                { name: '30대', value: 15 },
                { name: '40대', value: 6 },
                { name: '50대', value: 3 },
                { name: '60대+', value: 1 },
            ];
            break;
        case '28': // Tech (과학기술)
            gender = [
                { name: '남성', value: 85, color: '#3B82F6' },
                { name: '여성', value: 15, color: '#FF4B2B' },
            ];
            age = [
                { name: '10대', value: 10 },
                { name: '20대', value: 45 },
                { name: '30대', value: 30 },
                { name: '40대', value: 10 },
                { name: '50대', value: 4 },
                { name: '60대+', value: 1 },
            ];
            break;
        case '26': // Beauty & Style (뷰티)
            gender = [
                { name: '남성', value: 12, color: '#3B82F6' },
                { name: '여성', value: 88, color: '#FF4B2B' },
            ];
            age = [
                { name: '10대', value: 30 },
                { name: '20대', value: 45 },
                { name: '30대', value: 15 },
                { name: '40대', value: 7 },
                { name: '50대', value: 2 },
                { name: '60대+', value: 1 },
            ];
            break;
        case '1': // Kids/Animation (영화/애니메이션 - 키즈 포함 가능성)
            gender = [
                { name: '남성', value: 45, color: '#3B82F6' },
                { name: '여성', value: 55, color: '#FF4B2B' },
            ];
            age = [
                { name: '10세 미만', value: 40 },
                { name: '10대', value: 10 },
                { name: '20대', value: 5 },
                { name: '30대(부모)', value: 25 },
                { name: '40대(부모)', value: 15 },
                { name: '50대+', value: 5 },
            ];
            break;
        case '25': // News & Politics (뉴스/정치)
            gender = [
                { name: '남성', value: 65, color: '#3B82F6' },
                { name: '여성', value: 35, color: '#FF4B2B' },
            ];
            age = [
                { name: '10대', value: 2 },
                { name: '20대', value: 8 },
                { name: '30대', value: 15 },
                { name: '40대', value: 25 },
                { name: '50대', value: 30 },
                { name: '60대+', value: 20 },
            ];
            break;
    }

    return { gender, age, categoryName };
}
