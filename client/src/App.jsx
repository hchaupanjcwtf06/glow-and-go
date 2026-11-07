import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import SkinProfileCard from './components/SkinProfileCard';
import api from './services/api';

function AppContent() {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-300 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              G
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Glow &amp; Go
              </h1>
              <p className="text-[10px] text-slate-400">Skincare Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {authLoading ? (
              <span className="text-xs text-slate-400">Đang tải...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                  Xin chào, {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Guest Hero Section */}
        {!isAuthenticated && !authLoading && (
          <section className="bg-gradient-to-br from-rose-50 via-white to-amber-50/40 rounded-3xl border border-rose-100 p-8 sm:p-12 text-center shadow-xs">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 mb-4">
              Milestone M3 — Xác thực &amp; Onboarding Hồ sơ Da
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-xl mx-auto">
              Chăm sóc làn da khoa học, an toàn và cá nhân hóa
            </h2>
            <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Quản lý kệ mỹ phẩm Ngày &amp; Đêm, theo dõi đề xuất chu trình thông minh theo thời tiết/UV và cá nhân hóa theo mục tiêu làn da của bạn.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-md transition cursor-pointer"
              >
                Bắt đầu thiết lập hồ sơ da
              </button>
            </div>
          </section>
        )}

        {/* Authenticated Dashboard View */}
        {isAuthenticated && (
          <section className="space-y-6">
            {!user.skinProfile?.isOnboarded ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <h3 className="font-bold text-amber-900 text-base">
                  Chưa hoàn tất khảo sát hồ sơ làn da
                </h3>
                <p className="text-xs text-amber-700 max-w-md mx-auto">
                  Hãy hoàn thành khảo sát để Glow &amp; Go có thể cá nhân hóa đề xuất chu trình và kệ mỹ phẩm cho bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Bắt đầu khảo sát ngay
                </button>
              </div>
            ) : (
              <SkinProfileCard
                user={user}
                onEdit={() => setIsOnboardingOpen(true)}
              />
            )}

            {/* Upcoming Milestone Preview */}
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Kế hoạch tiếp theo — Milestone M4
              </p>
              <p className="text-sm font-medium text-slate-600 mt-1">
                Kệ mỹ phẩm ảo Ngày &amp; Đêm (Virtual Shelf CRUD)
              </p>
            </div>
          </section>
        )}

        {/* System & Health Status Card */}
        <section
          aria-labelledby="system-status-title"
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3
              id="system-status-title"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Trạng thái hệ thống (API &amp; Database Health)
            </h3>
            {healthData?.database === 'connected' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                DB Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                DB Disconnected (Local Mode)
              </span>
            )}
          </div>

          {healthError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs">
              Lỗi kết nối backend: {healthError}
            </div>
          )}

          {healthData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  API Status
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {healthData.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Environment
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {healthData.environment}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Database
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {healthData.database}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Uptime
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {healthData.uptime}s
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Glow &amp; Go &bull; React 19 + Tailwind v4 + Express + MongoDB Atlas
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
