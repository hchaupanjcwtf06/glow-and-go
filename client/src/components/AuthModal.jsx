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
        'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                !isRegister
                  ? 'bg-rose-50 text-rose-600'
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
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                isRegister
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-lg leading-none"
            aria-label="Đóng cửa sổ"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900">
            {isRegister ? 'Tạo tài khoản Glow & Go' : 'Chào mừng bạn quay lại'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Tạo tài khoản để cá nhân hóa chu trình chăm sóc da khoa học.'
              : 'Đăng nhập để theo dõi tủ mỹ phẩm và chu trình skincare mỗi ngày.'}
          </p>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Họ và tên
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@glowandgo.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? 'Đang xử lý...'
              : isRegister
              ? 'Hoàn tất đăng ký'
              : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
