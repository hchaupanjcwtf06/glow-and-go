const SKIN_TYPE_DETAILS = {
  oily: { label: 'Da Dầu', icon: '💧', color: 'from-cyan-400 to-blue-500', desc: 'Bóng nhờn, dễ bít tắc' },
  dry: { label: 'Da Khô', icon: '🌵', color: 'from-amber-400 to-orange-500', desc: 'Căng rát, thiếu độ ẩm' },
  combination: { label: 'Da Hỗn Hợp', icon: '⚖️', color: 'from-pink-400 to-rose-500', desc: 'Dầu chữ T, khô vùng má' },
  normal: { label: 'Da Thường', icon: '✨', color: 'from-emerald-400 to-teal-500', desc: 'Cân bằng, rạng rỡ' },
  sensitive: { label: 'Da Nhạy Cảm', icon: '🌸', color: 'from-rose-400 to-fuchsia-500', desc: 'Dễ châm chích, mẩn đỏ' },
};

const SENSITIVITY_DETAILS = {
  low: { label: 'Nhẹ dịu (Thấp)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🌿' },
  medium: { label: 'Bình thường (Vừa)', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: '⚡' },
  high: { label: 'Rất nhạy cảm (Cao)', badge: 'bg-rose-100 text-rose-800 border-rose-200', icon: '🔥' },
};

const CONCERN_LABELS = {
  acne: { label: 'Mụn viêm & Mụn ẩn', icon: '🫧' },
  pigmentation: { label: 'Thâm nám & Đốm nâu', icon: '☀️' },
  aging: { label: 'Nếp nhăn & Lão hóa', icon: '⏳' },
  pores: { label: 'Lỗ chân lông to', icon: '🎯' },
  sensitivity: { label: 'Dễ ửng đỏ / Kích ứng', icon: '🌸' },
  dullness: { label: 'Xỉn màu & Mệt mỏi', icon: '🌙' },
};

const GOAL_LABELS = {
  hydration: { label: 'Cấp ẩm căng mọng Glass Skin', icon: '💧' },
  acne_control: { label: 'Làm sạch sâu & Dứt điểm mụn', icon: '🫧' },
  brightening: { label: 'Bật tone sáng & Đều màu da', icon: '✨' },
  anti_aging: { label: 'Trẻ hóa & Tăng độ đàn hồi', icon: '🌟' },
  barrier_repair: { label: 'Phục hồi hàng rào ẩm khoẻ', icon: '🛡️' },
};

export default function SkinProfileCard({ user, onEdit }) {
  const profile = user?.skinProfile || {};
  const skinInfo = SKIN_TYPE_DETAILS[profile.skinType] || {
    label: 'Chưa thiết lập',
    icon: '🧖‍♀️',
    color: 'from-slate-400 to-slate-500',
    desc: 'Chưa chọn',
  };
  const sensitivityInfo = SENSITIVITY_DETAILS[profile.sensitivityLevel] || {
    label: 'Chưa rõ',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '✨',
  };

  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative background glow inside card */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-pink-300/30 to-amber-200/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-rose-300/20 to-purple-200/30 blur-2xl pointer-events-none" />

      {/* Header section with Skin ID banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rose-100/80 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center text-2xl shadow-md shadow-rose-200">
            🧖‍♀️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs">
                Skin ID Card ✨
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                #{user._id?.slice(-6) || 'GLOW01'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {user.name}
            </h2>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/90 hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center space-x-1.5"
        >
          <span>✏️</span>
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>

      {/* Primary Attributes (Skin Type & Sensitivity) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Skin Type Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 to-rose-50/60 border border-rose-100/90 shadow-xs flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skinInfo.color} flex items-center justify-center text-xl text-white shadow-sm shrink-0`}
          >
            {skinInfo.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Loại da chủ đạo
            </span>
            <span className="text-base font-extrabold text-slate-900 block leading-tight">
              {skinInfo.label}
            </span>
            <span className="text-xs text-slate-500">{skinInfo.desc}</span>
          </div>
        </div>

        {/* Sensitivity Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 to-amber-50/60 border border-amber-100/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xl text-white shadow-sm shrink-0">
            {sensitivityInfo.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Độ nhạy cảm
            </span>
            <span className="text-base font-extrabold text-slate-900 block leading-tight">
              {sensitivityInfo.label}
            </span>
            <span className="text-xs text-slate-500">Mức độ kích ứng với hoạt chất</span>
          </div>
        </div>
      </div>

      {/* Concerns & Goals */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-2">
        {/* Concerns */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2.5">
            <span>🎯</span>
            <span>Vấn đề da cần cải thiện</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.concerns?.length > 0 ? (
              profile.concerns.map((id) => {
                const item = CONCERN_LABELS[id] || { label: id, icon: '🫧' };
                return (
                  <span
                    key={id}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs hover:scale-105 transition-transform"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 italic">Chưa chọn vấn đề nào</span>
            )}
          </div>
        </div>

        {/* Goals */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2.5">
            <span>✨</span>
            <span>Mục tiêu chăm sóc da</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.goals?.length > 0 ? (
              profile.goals.map((id) => {
                const item = GOAL_LABELS[id] || { label: id, icon: '🌟' };
                return (
                  <span
                    key={id}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs hover:scale-105 transition-transform"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 italic">Chưa chọn mục tiêu nào</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Advisory */}
      <div className="relative z-10 pt-4 mt-6 border-t border-rose-100/60 flex items-center justify-between text-[11px] text-slate-400 italic">
        <span>* Hồ sơ là cơ sở cá nhân hóa chu trình gợi ý khoa học &amp; lành tính (wellness guidance).</span>
        <span className="hidden sm:inline font-semibold text-rose-400 not-italic">#GlowAndGo</span>
      </div>
    </div>
  );
}
