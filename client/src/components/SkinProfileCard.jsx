const SKIN_TYPE_LABELS = {
  oily: 'Da dầu',
  dry: 'Da khô',
  combination: 'Da hỗn hợp',
  normal: 'Da thường',
  sensitive: 'Da nhạy cảm',
};

const SENSITIVITY_LABELS = {
  low: 'Nhạy cảm thấp',
  medium: 'Nhạy cảm trung bình',
  high: 'Rất nhạy cảm',
};

const CONCERN_LABELS = {
  acne: 'Mụn viêm / Mụn ẩn',
  pigmentation: 'Thâm nám & Đốm nâu',
  aging: 'Nếp nhăn & Lão hóa',
  pores: 'Lỗ chân lông to',
  sensitivity: 'Dễ mẩn đỏ / Kích ứng',
  dullness: 'Xỉn màu & Mệt mỏi',
};

const GOAL_LABELS = {
  hydration: 'Cấp ẩm sâu & Căng mọng',
  acne_control: 'Ngừa & Giảm mụn',
  brightening: 'Làm sáng & Đều màu',
  anti_aging: 'Trẻ hóa & Đàn hồi',
  barrier_repair: 'Phục hồi hàng rào da',
};

export default function SkinProfileCard({ user, onEdit }) {
  const profile = user?.skinProfile || {};

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
            Hồ sơ da cá nhân
          </span>
          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          Chỉnh sửa hồ sơ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Loại da
          </span>
          <span className="text-base font-bold text-slate-800">
            {SKIN_TYPE_LABELS[profile.skinType] || 'Chưa thiết lập'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Độ nhạy cảm
          </span>
          <span className="text-base font-bold text-slate-800">
            {SENSITIVITY_LABELS[profile.sensitivityLevel] || 'Chưa thiết lập'}
          </span>
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Vấn đề da quan tâm
        </span>
        <div className="flex flex-wrap gap-1.5">
          {profile.concerns?.length > 0 ? (
            profile.concerns.map((id) => (
              <span
                key={id}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100"
              >
                {CONCERN_LABELS[id] || id}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa chọn vấn đề nào</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Mục tiêu chăm sóc da
        </span>
        <div className="flex flex-wrap gap-1.5">
          {profile.goals?.length > 0 ? (
            profile.goals.map((id) => (
              <span
                key={id}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {GOAL_LABELS[id] || id}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa chọn mục tiêu nào</span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          * Thông tin hồ sơ da được dùng làm căn cứ đề xuất sản phẩm và chu trình chăm sóc sức khỏe da liễu hàng ngày (wellness guidance), không thay thế chẩn đoán y khoa.
        </p>
      </div>
    </div>
  );
}

