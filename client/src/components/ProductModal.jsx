import { useState } from 'react';
import { CATEGORY_CONFIG, SAMPLE_QUICK_SEARCHES } from '../utils/productConstants';
import api from '../services/api';

const CATEGORIES = [
  { id: 'cleanser', label: 'Sữa rửa mặt / Làm sạch', emoji: '🧼' },
  { id: 'toner', label: 'Nước cân bằng / Toner', emoji: '💧' },
  { id: 'serum', label: 'Tinh chất / Serum', emoji: '🧪' },
  { id: 'treatment', label: 'Đặc trị / Treatment (BHA/Retinol)', emoji: '🎯' },
  { id: 'moisturizer', label: 'Kem dưỡng / Khóa ẩm', emoji: '🧴' },
  { id: 'sunscreen', label: 'Kem chống nắng (Bảo vệ)', emoji: '☀️' },
  { id: 'mask', label: 'Mặt nạ dưỡng (Mask)', emoji: '🧖‍♀️' },
  { id: 'other', label: 'Sản phẩm khác', emoji: '✨' },
];

const ROUTINE_TIMES = [
  { id: 'day', label: '☀️ Buổi Sáng', desc: 'Dành riêng cho routine sáng' },
  { id: 'night', label: '🌙 Buổi Tối', desc: 'Dành riêng cho routine tối' },
  { id: 'both', label: '☀️🌙 Cả Ngày & Đêm', desc: 'Dùng được cả 2 buổi' },
];

const PAO_PRESETS = [3, 6, 12, 18, 24];

function ProductForm({ productToEdit, onClose, onSave }) {
  const [name, setName] = useState(() => productToEdit?.name || '');
  const [brand, setBrand] = useState(() => productToEdit?.brand || '');
  const [category, setCategory] = useState(() => productToEdit?.category || 'cleanser');
  const [routineTime, setRoutineTime] = useState(() => productToEdit?.routineTime || 'both');
  const [openedDate, setOpenedDate] = useState(() =>
    productToEdit?.openedDate
      ? new Date(productToEdit.openedDate).toISOString().split('T')[0]
      : ''
  );
  const [paoMonths, setPaoMonths] = useState(() => productToEdit?.paoMonths || 12);
  const [activeIngredients, setActiveIngredients] = useState(() =>
    productToEdit?.activeIngredients?.join(', ') || ''
  );
  const [notes, setNotes] = useState(() => productToEdit?.notes || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill state
  const [suggestQuery, setSuggestQuery] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [draftMeta, setDraftMeta] = useState(null);

  const handleAutoFill = async (customQuery) => {
    const q = (typeof customQuery === 'string' ? customQuery : suggestQuery).trim();
    if (!q || q.length < 2) {
      setError('Vui lòng nhập ít nhất 2 ký tự tên hoặc thương hiệu sản phẩm.');
      return;
    }

    setError(null);
    setSuggesting(true);
    try {
      const res = await api.post('/products/suggest', { query: q });
      const draft = res.data?.draft;
      if (draft) {
        if (draft.name) setName(draft.name);
        if (draft.brand) setBrand(draft.brand);
        if (draft.category) setCategory(draft.category);
        if (draft.routineTime) setRoutineTime(draft.routineTime);
        if (draft.paoMonths) setPaoMonths(draft.paoMonths);
        if (Array.isArray(draft.activeIngredients)) {
          setActiveIngredients(draft.activeIngredients.join(', '));
        }
        if (draft.notes) setNotes(draft.notes);

        setDraftMeta({
          source: draft.source,
          confidence: draft.confidence,
          disclaimer: draft.disclaimer,
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Không thể tải gợi ý tự động. Bạn vẫn có thể tự điền thông tin bên dưới.';
      setError(msg);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    setSubmitting(true);
    try {
      const ingredientsArray = activeIngredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        category,
        routineTime,
        openedDate: openedDate ? new Date(openedDate).toISOString() : null,
        paoMonths: Number(paoMonths) || null,
        activeIngredients: ingredientsArray,
        notes: notes.trim(),
      };

      await onSave(payload, productToEdit?._id);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Không thể lưu sản phẩm. Vui lòng thử lại!';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
      {/* Colorful top bar */}
      <div className="h-2.5 w-full bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 shrink-0" />

      {/* Modal Header */}
      <div className="p-6 sm:p-7 pb-4 border-b border-rose-100/70 flex items-center justify-between shrink-0">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 mb-1">
            <span>🧴</span>
            <span>{productToEdit ? 'Chỉnh sửa' : 'Thêm mới'}</span>
          </span>
          <h3 id="product-modal-title" className="text-xl font-extrabold text-slate-900">
            {productToEdit ? 'Cập nhật thông tin sản phẩm' : 'Thêm mỹ phẩm vào kệ'}
          </h3>
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

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-7 pt-4 overflow-y-auto space-y-5 flex-1">
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* AI Auto-fill Assistant Bar */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/70 border border-indigo-100/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center space-x-1.5">
              <span>⚡</span>
              <span>Gợi ý tự động (AI Auto-fill)</span>
            </label>
            <span className="text-[10px] font-semibold text-indigo-600 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-100">
              Bản nháp thông minh
            </span>
          </div>
          <p className="text-[11px] text-indigo-800/80 mb-2.5">
            Nhập tên mỹ phẩm của bạn để tự động điền phân loại, hoạt chất và hạn mở nắp.
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={suggestQuery}
              onChange={(e) => setSuggestQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAutoFill();
                }
              }}
              placeholder="VD: Paula's Choice BHA, KCN Anessa, CeraVe..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-indigo-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            <button
              type="button"
              onClick={() => handleAutoFill()}
              disabled={suggesting}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center space-x-1 shrink-0"
            >
              {suggesting ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Đang tìm...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Điền nhanh</span>
                </>
              )}
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-indigo-100/60">
            <span className="text-[10px] font-bold text-indigo-500">Mẫu:</span>
            {SAMPLE_QUICK_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSuggestQuery(item.query);
                  handleAutoFill(item.query);
                }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/90 hover:bg-white text-indigo-700 border border-indigo-200/60 hover:border-indigo-300 transition shadow-2xs cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Draft Disclaimer & User Review Banner */}
        {draftMeta && (
          <div className="rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 space-y-1 text-slate-800 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span className="flex items-center space-x-1.5">
                <span>✨</span>
                <span>
                  Bản nháp gợi ý tự động (
                  {draftMeta.source === 'catalog'
                    ? 'Thư viện mỹ phẩm chuẩn'
                    : draftMeta.source === 'gemini'
                    ? 'Gemini Skincare AI'
                    : 'Từ khóa phân tích'}
                  )
                </span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold uppercase">
                {draftMeta.confidence === 'high' ? 'Độ khớp cao' : 'Bản nháp dự thảo'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {draftMeta.disclaimer ||
                'Thông tin đã được điền sẵn vào các trường bên dưới. Bạn hoàn toàn có thể chỉnh sửa tự do trước khi lưu vào kệ.'}
            </p>
          </div>
        )}

        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Tên sản phẩm <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Hyaluronic Acid 2% + B5"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Thương hiệu
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ví dụ: The Ordinary, La Roche-Posay, Anessa..."
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Phân loại chu trình
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label} ({CATEGORY_CONFIG[cat.id]?.step})
              </option>
            ))}
          </select>
        </div>

        {/* Routine Time Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Thời điểm sử dụng trong ngày
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROUTINE_TIMES.map((item) => {
              const selected = routineTime === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRoutineTime(item.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                    selected
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/60 font-semibold'
                  }`}
                >
                  <span className="text-xs block leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PAO & Opened Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ngày bắt đầu mở nắp
            </label>
            <input
              type="date"
              value={openedDate}
              onChange={(e) => setOpenedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400 transition bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Hạn mở nắp PAO (tháng)
            </label>
            <div className="flex items-center space-x-1.5">
              {PAO_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaoMonths(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    paoMonths === m
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Ingredients */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Hoạt chất chính (Phân tách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={activeIngredients}
            onChange={(e) => setActiveIngredients(e.target.value)}
            placeholder="Niacinamide, B5, Salicylic Acid, Vitamin C..."
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Ghi chú cá nhân
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cảm nhận khi thoa, bước kết hợp..."
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-rose-200 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? 'Đang lưu...'
              : productToEdit
              ? 'Lưu thay đổi ✨'
              : 'Thêm vào kệ mỹ phẩm 🧴'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProductModal({ isOpen, onClose, productToEdit, onSave }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <ProductForm
        key={productToEdit?._id || 'new-product'}
        productToEdit={productToEdit}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
