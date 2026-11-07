import { CATEGORY_CONFIG, ROUTINE_TIME_BADGES } from '../utils/productConstants';

function calculatePaoStatus(openedDate, paoMonths) {
  if (!openedDate || !paoMonths) return null;

  const opened = new Date(openedDate);
  const now = new Date();
  const diffTime = Math.abs(now - opened);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = diffDays / 30.44;
  const remainingMonths = Math.round((paoMonths - diffMonths) * 10) / 10;

  if (remainingMonths <= 0) {
    return {
      expired: true,
      label: `⚠️ Hết hạn mở nắp PAO`,
      badge: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
    };
  } else if (remainingMonths <= 1.5) {
    return {
      expired: false,
      label: `⏳ Còn ${remainingMonths} tháng`,
      badge: 'bg-amber-100 text-amber-800 border-amber-200 font-bold',
    };
  } else {
    return {
      expired: false,
      label: `🛡️ PAO: còn ${Math.round(remainingMonths)} tháng`,
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
}

export default function ProductCard({ product, onEdit, onDelete }) {
  const cat = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.other;
  const routine = ROUTINE_TIME_BADGES[product.routineTime] || ROUTINE_TIME_BADGES.both;
  const pao = calculatePaoStatus(product.openedDate, product.paoMonths);

  return (
    <div className="group relative bg-white/90 hover:bg-white rounded-3xl p-5 border border-rose-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top action row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
            <span>{cat.step}</span>
            <span>&bull;</span>
            <span>{cat.label}</span>
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${routine.badge}`}
          >
            {routine.label}
          </span>
        </div>

        {/* Product Visual & Name */}
        <div className="flex items-start space-x-3.5 my-2">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl text-white shadow-md shadow-slate-200 shrink-0 group-hover:scale-105 transition-transform`}
          >
            {cat.emoji}
          </div>

          <div className="min-w-0 flex-1">
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block truncate">
                {product.brand}
              </span>
            )}
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug truncate mt-0.5" title={product.name}>
              {product.name}
            </h4>
          </div>
        </div>

        {/* Active Ingredients Tags */}
        {product.activeIngredients?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.activeIngredients.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 truncate max-w-[140px]"
              >
                ✨ {item}
              </span>
            ))}
          </div>
        )}

        {/* Notes preview if any */}
        {product.notes && (
          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 italic bg-slate-50/80 p-2 rounded-xl border border-slate-100">
            &ldquo;{product.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Card Footer (PAO indicator + Actions) */}
      <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-xs">
        <div>
          {pao ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] border ${pao.badge}`}
            >
              {pao.label}
            </span>
          ) : product.paoMonths ? (
            <span className="text-[10px] font-medium text-slate-400">
              PAO: {product.paoMonths}M
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Chưa set ngày mở</span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Chỉnh sửa sản phẩm"
            aria-label="Sửa sản phẩm"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(product._id)}
            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Xóa khỏi kệ"
            aria-label="Xóa sản phẩm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
