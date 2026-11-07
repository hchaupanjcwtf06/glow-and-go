import { useState, useEffect } from 'react';
import api from '../services/api';
import CheckInModal from './CheckInModal';

export default function ReportsView() {
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([api.get('/checkins/report'), api.get('/checkins/history?limit=7')])
      .then(([reportRes, historyRes]) => {
        if (!ignore) {
          setReport(reportRes.data?.report || null);
          setHistory(historyRes.data?.checkIns || []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              'Không thể tải báo cáo xu hướng làn da.'
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  const handleCheckInSaved = () => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const recentTrend = report?.recentTrend || [];
  const feelingsBreakdown = report?.feelingsBreakdown || {};
  const sampleSize = report?.sampleSize || 0;

  return (
    <div className="space-y-6">
      {/* Top Overview & Action Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">📊</span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Báo cáo xu hướng &amp; Nhật ký làn da
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi tiến trình phục hồi và mức độ thích ứng mỹ phẩm qua từng ngày
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCheckInOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs shadow-md shadow-rose-200 transition cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
        >
          <span>✍️</span>
          <span>Ghi nhận check-in mới ✨</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 animate-pulse space-y-2">
          <span className="text-3xl block">📈</span>
          <p>Đang tổng hợp báo cáo xu hướng làn da...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      ) : (
        <>
          {/* Top 3 KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Average Rating Score */}
            <div className="glass-card rounded-3xl p-5 border border-rose-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Điểm hài lòng trung bình
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">
                  {report?.averageRating || 0}
                </span>
                <span className="text-sm font-bold text-amber-500">/ 5.0 ⭐</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {report?.averageRating >= 4
                  ? '✨ Làn da đang trong trạng thái rất tốt'
                  : report?.averageRating >= 3
                  ? '🌿 Làn da ổn định'
                  : '⚠️ Cần chú ý phục hồi thêm'}
              </p>
            </div>

            {/* Adherence Rate */}
            <div className="glass-card rounded-3xl p-5 border border-rose-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Độ kiên trì chu trình
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-rose-600">
                  {report?.adherenceRate || 0}%
                </span>
                <span className="text-xs font-bold text-slate-500">hoàn thành</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Duy trì ít nhất 3 bước skincare cơ bản mỗi buổi
              </p>
            </div>

            {/* Total Sample Size */}
            <div className="glass-card rounded-3xl p-5 border border-rose-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Cỡ mẫu ghi nhận (N)
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">
                  {sampleSize}
                </span>
                <span className="text-xs font-bold text-slate-500">lượt check-in</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Dữ liệu phân tích dựa trên nhật ký chủ quan
              </p>
            </div>
          </div>

          {/* 7-Day Visual Satisfaction Trend Chart */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Biểu đồ mức độ hài lòng 7 ngày gần nhất
                </h4>
                <p className="text-xs text-slate-500">
                  Điểm số từ 1 ⭐ (Kích ứng) đến 5 ⭐ (Căng bóng mượt mà)
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold border border-rose-100">
                7 ngày qua 📈
              </span>
            </div>

            {recentTrend.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có dữ liệu biểu đồ. Hãy thực hiện check-in đầu tiên!
              </div>
            ) : (
              <div className="pt-6 pb-2">
                <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 border-b border-slate-200">
                  {recentTrend.map((day, idx) => {
                    const heightPercent = Math.max(15, (day.rating / 5) * 100);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        {/* Rating pill on top of bar */}
                        <span className="text-[11px] font-black text-slate-700 opacity-90 group-hover:scale-110 transition-transform mb-1.5">
                          {day.rating}⭐
                        </span>

                        {/* Bar */}
                        <div
                          className="w-full max-w-[2.5rem] rounded-t-xl bg-gradient-to-t from-rose-400 to-pink-300 group-hover:from-rose-500 group-hover:to-pink-400 transition-all duration-300 shadow-2xs"
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* X-axis labels */}
                        <div className="mt-2 text-center">
                          <span className="block text-[11px] font-extrabold text-slate-700">
                            {day.shortDate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {day.routineType === 'night' ? '🌙' : '☀️'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Feelings Frequency Breakdown & Recent History Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feelings Breakdown */}
            <div className="glass-card rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900">
                Thống kê cảm nhận làn da
              </h4>

              {Object.keys(feelingsBreakdown).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Chưa có đủ cảm nhận để thống kê.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(feelingsBreakdown).map(([feel, count]) => {
                    const pct = Math.round((count / sampleSize) * 100);
                    return (
                      <div key={feel} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="capitalize">{feel}</span>
                          <span className="text-slate-400">
                            {count} lần ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-rose-400 to-pink-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Check-In Logs List */}
            <div className="glass-card rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900">
                Nhật ký các lần check-in gần nhất
              </h4>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Chưa có lịch sử check-in.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-800">
                          {item.date} ({item.routineType === 'night' ? '🌙 Tối' : '☀️ Sáng'})
                        </span>
                        <span className="font-black text-amber-500">
                          {item.rating} ⭐
                        </span>
                      </div>

                      {item.feelings?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.feelings.map((f) => (
                            <span
                              key={f}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scientific Transparency & Limitations Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed shadow-2xs space-y-1">
            <div className="flex items-center space-x-1.5 font-black text-amber-950">
              <span>🔬</span>
              <span>Minh bạch khoa học &amp; Giới hạn báo cáo</span>
            </div>
            <p className="text-[11px] text-amber-800 opacity-95">
              {report?.disclaimer ||
                'Báo cáo dựa trên đánh giá chủ quan của người dùng và cỡ mẫu N lượt ghi nhận. Đây là công cụ hỗ trợ theo dõi thói quen chăm da thường ngày, không thay thế chẩn đoán y tế.'}
            </p>
          </div>
        </>
      )}

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={handleCheckInSaved}
        routineType="day"
      />
    </div>
  );
}
