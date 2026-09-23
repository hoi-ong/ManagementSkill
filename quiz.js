// =====================================================
// MANAGEMENT SKILL QUIZ CONFIGURATION
// Version: API-based architecture
// =====================================================

const CONFIG = {

  // =====================================================
  // API ENDPOINTS
  // =====================================================

  // API nhận kết quả từ học viên (POST)
  apiUrl: "https://your-api-domain.com/api/quiz/submit",

  // API trả danh sách kết quả cho dashboard (GET)
  resultsApiUrl: "https://your-api-domain.com/api/quiz/results",

  // Timeout và retry
  apiTimeoutMs: 15000,
  apiRetryCount: 3,

  // =====================================================
  // QUIZ INFORMATION
  // =====================================================

  quizId: "management-skill",

  quizTitle: "TRẮC NGHIỆM KỸ NĂNG QUẢN LÝ",

  quizSubtitle:
    "Bài kiểm tra cuối khóa • 50 câu • 7 nhóm kỹ năng",

  // =====================================================
  // QUIZ SETTINGS
  // =====================================================

  // 0 = không giới hạn thời gian
  timeLimitMinutes: 0,

  // Bài 50 câu
  passScore: 30,

  // Hiển thị đáp án sau khi nộp
  showReview: true,

  // Email bắt buộc hay không
  requireEmail: false,

  // =====================================================
  // UI SETTINGS
  // =====================================================

  language: "vi",

  themeColor: "#1d4ed8",

  // =====================================================
  // VERSION
  // =====================================================

  version: "2.0.0"

};
