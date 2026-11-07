import { useState, useEffect } from 'react';
import api from '../services/api';
import { BADGE_GRADIENTS, BADGE_BORDERS } from '../utils/gamificationConstants';

export default function GamificationCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    let ignore = false;

    api
      .get('/gamification/badges')
      .then((res) => {
        if (!ignore) {
          setData(res.data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              'Không thể tải dữ liệu thành tích.'
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const streak = data?.streak || { currentStreak: 0, longestStreak: 0 };
  const badges = data?.badges || [];
  const stats = data?.stats || { unlockedCount: 0, totalBadges: 6, totalPoints: 0 };

  return (
    <div className="space-y-6">
      {/* Streak Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-rose-100 shadow-sm bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-amber-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start space-x-4">
            {/* Animated Flame Icon Container */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-orange-200 shrink-0 transform hover:scale-105 transition-transform">
              🔥
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Chuỗi Chăm Da Liên Tục
                </span>
                {streak.isActiveToday && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ Đã duy trì hôm nay
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {streak.currentStreak}{' '}
                <span className="text-lg font-bold text-slate-600">Ngày liên tiếp!</span>
              </h3>

              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Kỷ lục chuỗi dài nhất: <strong className="text-slate-800">{streak.longestStreak} ngày</strong>. Sự kiên trì mỗi ngày giúp màng ẩm tự nhiên của da phục hồi bền vững.
              </p>
            </div>
          </div>

          {/* Gamification Points & Badges Stat Box */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-2xs shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Điểm Rạng Rỡ
            </span>
            <span className="text-2xl font-black bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
              💎 {stats.totalPoints} pts
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Đã mở {stats.unlockedCount} / {stats.totalBadges} huy hiệu
            </span>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              Bộ sưu tập huy hiệu Skincare (Achievements)
            </h4>
            <p className="text-xs text-slate-500">
              Mở khóa các cột mốc quan trọng trên hành trình sở hữu làn da rạng rỡ
            </p>
          </div>
          <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            {stats.unlockedCount} / {stats.totalBadges} Mở khóa
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
            <span className="text-3xl block">🏆</span>
            <p>Đang kiểm tra thành tích...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const borderClass = BADGE_BORDERS[badge.id] || 'border-slate-200 bg-slate-50/50';
              const gradientClass = BADGE_GRADIENTS[badge.id] || 'from-rose-400 to-pink-500';

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    badge.isUnlocked
                      ? `${borderClass} hover:shadow-md hover:scale-[1.02] shadow-2xs`
                      : 'border-slate-200/80 bg-slate-50/40 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Badge Unlocked Top Glow Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                        badge.isUnlocked
                          ? `bg-gradient-to-tr ${gradientClass} text-white shadow-rose-200`
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {badge.emoji}
                    </div>

                    <div className="text-right">
                      {badge.isUnlocked ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span>✓ Đã mở khóa</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                          <span>🔒 Đang tiến độ</span>
                        </span>
                      )}
                      <span className="block text-[11px] font-bold text-amber-600 mt-0.5">
                        +{badge.points} pts
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">{badge.title}</h5>
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">{badge.name}</p>
                    <p className="text-xs text-slate-600 leading-snug">{badge.description}</p>
                  </div>

                  {/* Progress Bar for Locked Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                      <span>{badge.criteriaText}</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          badge.isUnlocked
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-rose-400 to-amber-400'
                        }`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Badge Interactive Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 text-center space-y-4">
            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-md ${
                selectedBadge.isUnlocked
                  ? `bg-gradient-to-tr ${
                      BADGE_GRADIENTS[selectedBadge.id] || 'from-rose-400 to-amber-300'
                    } text-white`
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {selectedBadge.emoji}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {selectedBadge.isUnlocked ? '🌟 Huy Hiệu Đã Đạt Được' : '🔒 Mục Tiêu Phấn Đấu'}
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-2">{selectedBadge.title}</h4>
              <p className="text-xs font-semibold text-slate-400">{selectedBadge.name}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed px-2">
              {selectedBadge.description}
            </p>

            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-slate-700">
              <span className="font-bold block text-rose-800 mb-0.5">Tiêu chí:</span>
              <span>{selectedBadge.criteriaText}</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
