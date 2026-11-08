import { useState } from 'react';
import { useAuth } from '../context/useAuth';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại!';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden relative">
        {/* Colorful top accent bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300" />

        <div className="p-6 sm:p-8">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex p-1 bg-rose-50 rounded-2xl border border-rose-100/80">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  !isRegister
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isRegister
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng ký
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="text-center sm:text-left">
              <span className="text-2xl block mb-1">
                {isRegister ? '✨' : '💖'}
              </span>
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isRegister ? 'Khởi tạo hành trình làn da' : 'Chào mừng bạn quay lại!'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegister
                  ? 'Gia nhập Glow & Go để nhận chu trình skincare khoa học & cá nhân hóa.'
                  : 'Đăng nhập để xem tủ mỹ phẩm Ngày & Đêm và check-in mỗi ngày.'}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-medium flex items-start space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Tên của bạn
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Huyền Châu"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chau@gm.uit.edu.vn"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Mật khẩu
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-200 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting
                ? 'Đang xử lý...'
                : isRegister
                ? 'Tạo tài khoản ngay 🚀'
                : 'Vào Glow & Go ✨'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
