import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SPRTRecord, EvaluationResult, AIAnalysisResponse } from "../types";

// Safely retrieve API key, checking if process is defined to prevent crash in non-Node environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || "";
    }
  } catch (e) {
    // Ignore error
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const analyzeSPRTData = async (
  record: SPRTRecord,
  evaluation: EvaluationResult
): Promise<AIAnalysisResponse> => {
  try {
    if (!apiKey) {
      throw new Error("API Key chưa được cấu hình.");
    }

    const prompt = `
      Bạn là một chuyên gia về Đo lường Nhiệt (Metrology), chuyên về hiệu chuẩn nhiệt kế điện trở bạch kim chuẩn (SPRT) theo thang đo ITS-90.
      
      Hãy đánh giá dữ liệu hiệu chuẩn sau đây:
      - Thiết bị: ${record.manufacturer} Model ${record.model} (S/N: ${record.serial})
      - Năm hiệu chuẩn: ${record.calibrationYear}
      - Điện trở tại điểm ba của nước (R_tpw) hiện tại: ${record.r_tpw_current.toFixed(6)} Ω
      - Điện trở tại điểm ba của nước (R_tpw) trước đó: ${record.r_tpw_previous > 0 ? record.r_tpw_previous.toFixed(6) : 'Không có dữ liệu'} Ω
      - Độ trôi (Drift): ${evaluation.driftOhm.toExponential(2)} Ω (~${evaluation.driftMK.toFixed(2)} mK)
      - Tỷ số W(Ga): ${record.w_ga.toFixed(7)} (Yêu cầu ITS-90: >= 1.11807)
      - Tỷ số W(Hg): ${record.w_hg.toFixed(7)} (Yêu cầu ITS-90: <= 0.844235)
      - Trạng thái đánh giá sơ bộ: ${evaluation.status}

      Hãy đưa ra nhận xét kỹ thuật ngắn gọn, chuyên nghiệp bằng Tiếng Việt.
      Tập trung vào:
      1. Đánh giá chất lượng của nhiệt kế dựa trên tiêu chuẩn ITS-90.
      2. Nhận xét về độ ổn định (độ trôi) nếu có dữ liệu quá khứ.
      3. Khuyến nghị về việc sử dụng hoặc hiệu chuẩn lại.
      
      Trả về định dạng JSON khớp với schema.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn tình trạng (1-2 câu)" },
        technicalDetails: { type: Type.STRING, description: "Phân tích kỹ thuật chi tiết về các chỉ số W và Drift" },
        recommendation: { type: Type.STRING, description: "Khuyến nghị hành động tiếp theo" }
      },
      required: ["summary", "technicalDetails", "recommendation"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Không thể phân tích dữ liệu lúc này.",
      technicalDetails: `Lỗi: ${(error as Error).message || "Không xác định"}`,
      recommendation: "Vui lòng kiểm tra lại cấu hình hoặc đánh giá thủ công."
    };
  }
};