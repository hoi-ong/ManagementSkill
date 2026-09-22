// ===== CẤU HÌNH LƯU KẾT QUẢ LÊN GITHUB =====
const CONFIG = {
  owner:  "hoi-ong",           // tài khoản GitHub của bạn
  repo:   "ManagementSkill",   // repo chứa trang trắc nghiệm
  branch: "main",              // đổi thành "master" nếu repo dùng nhánh master
  path:   "ket-qua/ket-qua-trac-nghiem.xlsx", // file Excel lưu điểm trong repo

  // Token GitHub fine-grained: Settings → Developer settings → Personal access tokens
  //   → Fine-grained tokens → Repository access: chỉ chọn "hoi-ong/ManagementSkill"
  //   → Permissions → Contents: Read and write
  // ⚠️ Repo public: token dán vào đây sẽ bị lộ. Nên dùng token của tài khoản GitHub phụ.
  token: " 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",

  quizTitle: "TRẮC NGHIỆM KỸ NĂNG QUẢN LÝ",
  quizSubtitle: "Bài kiểm tra cuối khóa • 50 câu • 7 nhóm kỹ năng",
  timeLimitMinutes: 0,   // 0 = không giới hạn thời gian
  passScore: 30,         // điểm đạt (trên 50)
  showReview: true,      // hiện đáp án & giải thích sau khi nộp bài
  requireEmail: false    // bắt buộc nhập email hay không
};
