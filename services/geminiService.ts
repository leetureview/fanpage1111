
import { GoogleGenAI } from "@google/genai";
import { Fanpage, ContentPlan } from '../types';

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// Interface for the structured AI response
export interface AIPostResponse {
  analysis: string;
  hooks: string[];
  caption: string;
  cta: string;
  visual_ideas: string[];
  hashtag_suggestions: string[];
}

export const generatePostIdeas = async (fanpage: Fanpage): Promise<string[]> => {
    const ai = getGenAI();
    if (!ai) return ["Lỗi: Thiếu API Key."];

    const systemInstruction = `Bạn là chuyên gia chiến lược nội dung sáng tạo cho Fanpage "${fanpage.name}".
    Hãy gợi ý 5 ý tưởng nội dung hấp dẫn cho tuần tới phù hợp với nền tảng Facebook tại Việt Nam.
    Brand Voice (Giọng văn): ${fanpage.brandVoice}.
    
    TUÂN THỦ CHÍNH SÁCH FACEBOOK:
    - Nội dung sạch, không vi phạm tiêu chuẩn cộng đồng.
    - Tránh các chủ đề nhạy cảm, bạo lực, hoặc gây tranh cãi.
    
    Định dạng đầu ra: Một mảng JSON đơn giản chứa các chuỗi string tiếng Việt. Không dùng markdown block.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Hãy cho tôi 5 ý tưởng nội dung mới lạ liên quan đến: ${fanpage.niche}.`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text || "[]";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        // Ensure result is array of strings to avoid Object rendering crash
        return Array.isArray(parsed) ? parsed.map((item: any) => typeof item === 'string' ? item : JSON.stringify(item)) : [];
    } catch (error) {
        console.error("Gemini API Error:", error);
        return ["Không thể tạo ý tưởng lúc này. Vui lòng thử lại sau."];
    }
}

export const generateTopicSuggestion = async (fanpage: Fanpage, date: string): Promise<string> => {
    const ai = getGenAI();
    if (!ai) return `Bài viết ngày ${new Date(date).getDate()}`;

    const prompt = `Gợi ý 1 chủ đề bài viết ngắn gọn (dưới 10 từ) cho Fanpage "${fanpage.name}" (${fanpage.niche}) vào ngày ${date}. Chỉ trả về text chủ đề.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "Chủ đề mới";
    } catch (error) {
        return "Chủ đề mới";
    }
}

/**
 * ACTION: GeneratePostFromPlan
 * Thực hiện bước 2 trong flow tạo bài viết: Gợi ý ý tưởng & viết caption.
 */
export const generatePostFromPlan = async (
  plan: ContentPlan,
  fanpage: Fanpage
): Promise<AIPostResponse | null> => {
  const ai = getGenAI();
  if (!ai) return null;

  // 1. System Instruction: Định hình vai trò và giọng văn theo yêu cầu mới
  const systemInstruction = `Bạn là chuyên gia content marketing trong lĩnh vực vận tải công nghệ xanh, đang quản lý Fanpage "${fanpage.name}" (${fanpage.niche}).

  BỐI CẢNH:
  - Thương hiệu đang triển khai các chiến dịch ưu đãi/truyền thông hướng đến người dùng 25–45 tuổi.
  - Đối tượng mục tiêu: Yêu thích trải nghiệm xanh – tiết kiệm – văn minh.
  - Giọng văn (Brand Voice): Trẻ trung – thân thiện – tích cực.

  NHIỆM VỤ:
  Viết một bài đăng Facebook dựa trên chủ đề: "${plan.topic}" và ý tưởng: "${plan.mainIdea}".

  CẤU TRÚC BÀI VIẾT (BẮT BUỘC):
  1️⃣ Tiêu đề: Ngắn gọn, gây chú ý (viết in hoa hoặc làm nổi bật).
  2️⃣ Mở bài: Gợi hình ảnh & cảm xúc di chuyển thực tế tại địa phương (đánh vào insight kẹt xe, nóng bức, hoặc nhu cầu tiết kiệm).
  3️⃣ Thân bài: Nêu 3 lợi ích & ưu đãi cụ thể (sử dụng bullet point ✨).
  4️⃣ Kết bài: CTA mời gọi nhẹ nhàng, gần gũi.
  5️⃣ Footer: Kèm hashtag #SongXanhMoiNgay #TaxiDien #${fanpage.name.replace(/\s/g, '')}.

  YÊU CẦU HÌNH THỨC:
  - Độ dài: Tối đa 200 chữ.
  - Emoji: Sử dụng 🌿, ✨, ⚡, 🚕, 💚 một cách tự nhiên, sinh động.
  - Phong cách: Tham khảo style "🌿 Đi XANH - ƯU ĐÃI NGẬP TRÀN!..."

  🛑 TUÂN THỦ CHÍNH SÁCH FACEBOOK:
  - Không cam kết thái quá, không dùng từ ngữ vi phạm tiêu chuẩn cộng đồng.

  YÊU CẦU ĐẦU RA (JSON):
  Trả về JSON object (không markdown):
  - analysis: Phân tích ngắn gọn (1 câu tiếng Việt).
  - hooks: 3 câu Tiêu đề/Hook ngắn gọn khác nhau.
  - caption: Nội dung hoàn chỉnh theo cấu trúc 5 phần ở trên.
  - cta: 1-2 câu CTA dự phòng.
  - visual_ideas: 3 ý tưởng hình ảnh (string).
  - hashtag_suggestions: Mảng chứa chính xác các hashtag đã dùng trong bài (khoảng 3-5 tag).
  `;

  // 2. User Prompt: Input cụ thể của bài viết
  const prompt = `
  THÔNG TIN CONTENT PLAN:
  - Chủ đề (Topic): ${plan.topic}
  - Mục tiêu (Goal): ${plan.goal}
  - Ý tưởng chính: ${plan.mainIdea || "Tự sáng tạo dựa trên topic"}
  
  Hãy viết bài content Facebook chuẩn SEO, xanh mướt, dưới 200 từ.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    const result: AIPostResponse = {
        analysis: typeof parsed.analysis === 'string' ? parsed.analysis : "Không có phân tích.",
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks.map(String) : [],
        caption: typeof parsed.caption === 'string' ? parsed.caption : "",
        cta: typeof parsed.cta === 'string' ? parsed.cta : "",
        visual_ideas: Array.isArray(parsed.visual_ideas) ? parsed.visual_ideas.map(String) : [],
        hashtag_suggestions: Array.isArray(parsed.hashtag_suggestions) ? parsed.hashtag_suggestions.map(String) : []
    };

    return result;

  } catch (error) {
    console.error("Gemini API GeneratePostFromPlan Error:", error);
    return null;
  }
};
