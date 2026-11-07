# Glow & Go

Glow & Go là ứng dụng web quản lý quy trình chăm sóc da cá nhân (skincare) toàn diện, trực quan và an toàn. Ứng dụng cung cấp kệ mỹ phẩm ảo Ngày/Đêm, cá nhân hóa hồ sơ và mục tiêu làn da, đề xuất routine dựa trên điều kiện thời tiết/chỉ số UV/chất lượng không khí (AQI), hỗ trợ tự động điền thông tin sản phẩm bằng AI có người dùng xác nhận, cùng hệ thống nhật ký check-in và báo cáo tiến trình.

---

## 1. Công nghệ phê duyệt (Approved Tech Stack)

* **Frontend (`client/`)**:
  * Framework: React (khởi tạo với Vite)
  * Styling: Tailwind CSS
  * Animation: Motion for React (Framer Motion)
  * State Management & Networking: React Context API, Axios
  * Triển khai dự kiến: Vercel
* **Backend (`server/`)**:
  * Runtime & Framework: Node.js, Express
  * Cơ sở dữ liệu: MongoDB Atlas (MongoDB driver hoặc Mongoose)
  * Triển khai dự kiến: Render
* **Dịch vụ & Tích hợp bên ngoài**:
  * Dữ liệu thời tiết / UV / AQI
  * Google Gemini API (được gọi bảo mật qua backend để hỗ trợ gợi ý dữ liệu sản phẩm)

---

## 2. Kiến trúc & Nguyên tắc cốt lõi

* **Tách biệt Frontend & Backend**: Mã nguồn ứng dụng được chia thành hai thư mục độc lập `client/` và `server/`. Frontend chỉ giao tiếp qua REST API; không lưu trữ khóa bí mật, credentials hoặc token nhà cung cấp ở client.
* **An toàn da liễu (Skincare Safety)**: Mọi đề xuất routine chỉ mang tính chất hướng dẫn chăm sóc sức khỏe (wellness), không phải chẩn đoán y tế. Routine luôn đi qua bộ lọc an toàn theo luật (rule-based safety filter). Thông tin sản phẩm từ AI luôn ở dạng bản nháp cần người dùng xác nhận.
* **Anti-Over-Engineering**: Ưu tiên giải pháp tối giản, rõ ràng, không tự ý cài đặt thư viện khi chưa có nhu cầu sử dụng thực tế.

---

## 3. Yêu cầu môi trường & Thiết lập ban đầu

* **Node.js**: Phiên bản 20.x trở lên (khuyến nghị Node 24+).
* **npm**: Phiên bản 10.x trở lên.

> [!IMPORTANT]
> **Lưu ý dành cho người dùng Windows PowerShell:**
> Nếu hệ thống bật chính sách hạn chế thực thi script (`PSSecurityException` đối với `npm.ps1`), hãy gọi lệnh thông qua `npm.cmd` và `npx.cmd`:
> ```powershell
> npm.cmd -v
> npx.cmd -v
> ```

---

## 4. Lộ trình phát triển (Milestones)

- [x] **M0** — Xác minh repository, Git status, Node/npm, thiết lập `.gitignore` và `README.md`.
- [x] **M1** — Khởi tạo `client/` (React Vite) và `server/` (Express); kiểm tra chạy local và endpoint `/api/health`.
- [x] **M2** — Cấu hình biến môi trường, CORS, tích hợp API và kiểm thử triển khai ban đầu.
- [x] **M3** — Hệ thống xác thực và onboarding hồ sơ da + mục tiêu người dùng.
- [x] **M4** — CRUD sản phẩm và kệ mỹ phẩm trực quan Ngày/Đêm.
- [x] **M5** — Gợi ý sản phẩm tự động qua Gemini API có người dùng duyệt.
- [ ] **M6** — Tích hợp dữ liệu thời tiết/UV/AQI và engine đề xuất routine theo luật an toàn.
- [ ] **M7** — Nhật ký check-in hàng ngày, lịch sử sử dụng và báo cáo xu hướng.
- [ ] **M8** — Gamification (chuỗi streak), giao diện nâng cao và tương tác kéo thả.
