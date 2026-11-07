import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import SkinProfileCard from './components/SkinProfileCard';
import ProductShelf from './components/ProductShelf';
import DailyRoutine from './components/DailyRoutine';
import ReportsView from './components/ReportsView';
import GamificationCard from './components/GamificationCard';
import api from './services/api';

function AppContent() {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [mainTab, setMainTab] = useState('routine'); // 'routine' | 'shelf'

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setHealthData(res.data);
        setHealthError(null);
      })
      .catch((err) => {
        setHealthError(err.message || 'Cannot reach backend service');
      });
  }, []);

  const shouldShowOnboarding =
    isOnboardingOpen || (isAuthenticated && user && !user.skinProfile?.isOnboarded);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col font-sans relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
      {/* Ambient background blur orbs for dewy glow effect */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/40 via-pink-200/30 to-amber-100/30 blur-3xl pointer-events-none animate-float-slow -z-10" />
      <div className="fixed top-1/3 right-10 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-purple-200/30 via-pink-200/30 to-amber-200/30 blur-3xl pointer-events-none animate-float-reverse -z-10" />
      <div className="fixed bottom-10 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-teal-100/30 to-rose-100/30 blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-rose-100/60 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-300 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-rose-200 transform hover:rotate-6 transition-transform">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                  Glow &amp; Go
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-600">
                  v0.4
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Skincare Science &amp; Routine 🧖‍♀️
              </p>
            </div>
          </div>

          {/* User Nav Actions */}
          <div className="flex items-center space-x-3">
            {authLoading ? (
              <span className="text-xs font-semibold text-slate-400 animate-pulse">
                Đang tải...
              </span>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setMainTab('gamification')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-200/80 text-xs font-black text-orange-900 shadow-2xs transition cursor-pointer"
                  title="Xem chuỗi streak và huy hiệu thành tích"
                >
                  <span>🔥</span>
                  <span>Thành tích</span>
                </button>

                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-slate-700">
                  <span>🌸</span>
                  <span>{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-bold text-slate-600 hover:text-rose-600 shadow-2xs transition-all duration-200 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-extrabold shadow-md shadow-rose-200 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-1.5"
              >
                <span>Đăng nhập</span>
                <span>/</span>
                <span>Đăng ký ✨</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* Guest Hero Section */}
        {!isAuthenticated && !authLoading && (
          <section className="glass-card rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
            {/* Sparkle badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-rose-100 to-amber-100 text-rose-800 border border-rose-200/60 shadow-xs mb-6">
              <span>💖</span>
              <span>Làn da rạng rỡ bắt đầu từ hôm nay</span>
              <span>✨</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-2xl mx-auto leading-[1.15]">
              Quản lý tủ skincare &amp; chu trình cá nhân hóa
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Tạm biệt chu trình skincare lộn xộn. Với Glow &amp; Go, bạn sở hữu kệ mỹ phẩm Ngày &amp; Đêm trực quan, gợi ý chăm da theo thời tiết/UV và an toàn với hàng rào bảo vệ.
            </p>

            {/* Quick feature stickers */}
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
              <span className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/90 text-rose-700 border border-rose-200/80 shadow-2xs">
                ☀️ Kệ mỹ phẩm Buổi Sáng
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/90 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                🌙 Kệ phục hồi Buổi Tối
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/90 text-amber-700 border border-amber-200/80 shadow-2xs">
                🌤️ Gợi ý theo chỉ số UV &amp; AQI
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/90 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                🛡️ Bộ lọc xung đột hoạt chất
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-200 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-2"
              >
                <span>Bắt đầu thiết lập hồ sơ da ngay</span>
                <span className="text-lg">→</span>
              </button>
            </div>

            {/* Visual routine mockup preview */}
            <div className="mt-12 pt-8 border-t border-rose-100/70 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/70 border border-rose-100/80 shadow-2xs">
                <span className="text-2xl block mb-2">🧼</span>
                <p className="font-extrabold text-xs text-rose-600 uppercase tracking-wider">
                  Bước 1 &bull; Làm sạch dịu nhẹ
                </p>
                <p className="font-bold text-sm text-slate-800 mt-1">
                  Gentle Cleanser
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Không gây khô căng, cân bằng độ pH tự nhiên.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-rose-100/80 shadow-2xs">
                <span className="text-2xl block mb-2">💧</span>
                <p className="font-extrabold text-xs text-cyan-600 uppercase tracking-wider">
                  Bước 2 &bull; Cấp ẩm chuyên sâu
                </p>
                <p className="font-bold text-sm text-slate-800 mt-1">
                  Hyaluronic &amp; B5 Serum
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Căng bóng da chuẩn glass skin, làm dịu tức thì.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-rose-100/80 shadow-2xs">
                <span className="text-2xl block mb-2">☀️</span>
                <p className="font-extrabold text-xs text-amber-600 uppercase tracking-wider">
                  Bước 3 &bull; Bảo vệ tia cực tím
                </p>
                <p className="font-bold text-sm text-slate-800 mt-1">
                  Daily Sunscreen SPF50+
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chống nắng phổ rộng, cảnh báo chỉ số UV hàng ngày.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Authenticated Dashboard View */}
        {isAuthenticated && (
          <section className="space-y-8 animate-in fade-in duration-300">
            {/* Friendly Greeting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-rose-100/70 via-pink-50/80 to-amber-100/60 border border-rose-200/60 shadow-xs">
              <div className="flex items-center space-x-3">
                <span className="text-3xl animate-bounce">👋</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Chào {user.name}, chúc bạn một ngày rạng rỡ! ✨
                  </h3>
                  <p className="text-xs text-slate-600">
                    Đừng quên cấp đủ ẩm và thoa kem chống nắng trước khi ra ngoài nhé.
                  </p>
                </div>
              </div>

              {!user.skinProfile?.isOnboarded && (
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                >
                  Hoàn tất hồ sơ da 🎯
                </button>
              )}
            </div>

            {/* If onboarding not completed */}
            {!user.skinProfile?.isOnboarded ? (
              <div className="glass-card rounded-3xl p-8 text-center space-y-4 border-2 border-dashed border-rose-200">
                <span className="text-4xl block">📋</span>
                <h3 className="font-black text-slate-900 text-xl">
                  Bạn chưa hoàn tất khảo sát hồ sơ làn da
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Chỉ mất 1 phút để chọn loại da và mục tiêu chăm sóc. Glow &amp; Go sẽ điều chỉnh chu trình mỹ phẩm phù hợp nhất cho bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  Khảo sát làn da ngay ✨
                </button>
              </div>
            ) : (
              <>
                <SkinProfileCard
                  user={user}
                  onEdit={() => setIsOnboardingOpen(true)}
                />

                {/* Dashboard View Switcher: Routine vs Shelf vs Reports */}
                <div className="flex items-center space-x-2 border-b border-rose-100/80 pb-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setMainTab('routine')}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
                      mainTab === 'routine'
                        ? 'border-rose-500 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🌤️</span>
                    <span>Chu trình &amp; Thời tiết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainTab('shelf')}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
                      mainTab === 'shelf'
                        ? 'border-rose-500 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🧴</span>
                    <span>Kệ mỹ phẩm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainTab('reports')}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
                      mainTab === 'reports'
                        ? 'border-rose-500 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>📊</span>
                    <span>Báo cáo &amp; Nhật ký da</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainTab('gamification')}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
                      mainTab === 'gamification'
                        ? 'border-rose-500 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🏆</span>
                    <span>Thành tích &amp; Streak</span>
                  </button>
                </div>

                {mainTab === 'routine' ? (
                  <DailyRoutine onNavigateToShelf={() => setMainTab('shelf')} />
                ) : mainTab === 'shelf' ? (
                  <ProductShelf />
                ) : mainTab === 'reports' ? (
                  <ReportsView />
                ) : (
                  <GamificationCard />
                )}
              </>
            )}
          </section>
        )}

        {/* Compact System & API Health Dock */}
        <section
          aria-labelledby="system-dock-title"
          className="pt-4 border-t border-rose-100/80"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span id="system-dock-title" className="font-bold text-slate-700">
                Hệ thống Glow &amp; Go
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>Express API: {healthData?.status || 'Active'}</span>
              <span className="text-slate-300">&bull;</span>
              <span>
                Database:{' '}
                {healthData?.database === 'connected' ? (
                  <strong className="text-emerald-600 font-bold">Atlas Connected</strong>
                ) : (
                  <span className="text-amber-600 font-semibold">Local Ready</span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span>Env: {healthData?.environment || 'development'}</span>
              <span>Uptime: {healthData?.uptime || 0}s</span>
            </div>
          </div>

          {healthError && (
            <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 p-2 text-rose-700 text-xs">
              Lỗi kết nối: {healthError}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100/70 bg-white/60 py-6 text-center text-xs font-medium text-slate-400">
        Glow &amp; Go &bull; React 19 + Tailwind CSS v4 &bull; Chăm da khoa học &amp; phong cách 💖
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <OnboardingModal
        isOpen={Boolean(shouldShowOnboarding)}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
