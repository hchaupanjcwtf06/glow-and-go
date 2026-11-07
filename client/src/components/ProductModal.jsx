import { useState } from 'react';
import { CATEGORY_CONFIG } from '../utils/productConstants';

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
