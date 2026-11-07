import CheckIn from '../models/CheckIn.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isDbConnected } from '../db.js';
import { DEMO_SHELF_PRODUCTS } from '../services/routineEngine.js';

// Predefined Skincare Achievements & Badges definition
export const BADGES_DEFINITION = [
  {
    id: 'glow-starter',
    name: 'Glow Starter',
    title: 'Khởi Đầu Rạng Rỡ',
    emoji: '🌟',
    description: 'Hoàn tất khảo sát hồ sơ làn da và mục tiêu chăm sóc cá nhân.',
    category: 'onboarding',
    points: 50,
  },
  {
    id: 'shelf-curator',
    name: 'Shelf Curator',
    title: 'Chuyên Gia Tủ Mỹ Phẩm',
    emoji: '🧴',
    description: 'Sở hữu ít nhất 3 sản phẩm được phân loại khoa học trên kệ mỹ phẩm.',
    category: 'shelf',
    points: 100,
  },
  {
    id: 'sun-shield',
    name: 'Sun Shield',
    title: 'Hộ Vệ Ánh Nắng',
    emoji: '☀️',
    description: 'Thêm kem chống nắng quang phổ rộng và thực hiện routine bảo vệ ban ngày.',
    category: 'safety',
    points: 150,
  },
  {
    id: 'streak-flame',
    name: 'Streak Flame',
    title: 'Chiến Thần Kiên Trì',
    emoji: '🔥',
    description: 'Duy trì chuỗi chăm sóc da và check-in liên tục ít nhất 3 ngày.',
    category: 'streak',
    points: 200,
  },
  {
    id: 'glass-skin-master',
    name: 'Glass Skin Master',
    title: 'Bậc Thầy Làn Da Pha Lê',
    emoji: '💎',
    description: 'Đạt chuỗi kiên trì 7 ngày liên tiếp để phục hồi màng ẩm tối ưu.',
    category: 'streak',
    points: 300,
  },
  {
    id: 'barrier-hero',
    name: 'Barrier Hero',
    title: 'Chiến Binh Hàng Rào Ẩm',
    emoji: '🛡️',
    description: 'Bảo vệ da với các hoạt chất phục hồi (Ceramide/HA/B5/Rau má).',
    category: 'actives',
    points: 150,
  },
];

/**
 * Calculates current and longest consecutive daily check-in streak
 */
export function calculateStreak(datesList) {
  if (!Array.isArray(datesList) || datesList.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  // Deduplicate and sort descending (newest first)
  const uniqueDates = Array.from(new Set(datesList.filter(Boolean))).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newest = uniqueDates[0];
  const isActiveToday = newest === todayStr;
  const isStreakAlive = newest === todayStr || newest === yesterdayStr;

  let currentStreak = 0;
  if (isStreakAlive) {
    let expectedDate = new Date(newest);
    for (const dStr of uniqueDates) {
      const actualDate = new Date(dStr);
      const diffDays = Math.round(
        (expectedDate - actualDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded history
  let longestStreak = currentStreak;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const cur = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diff = Math.round((cur - next) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    isActiveToday,
    lastCheckInDate: newest,
  };
}

/**
 * Controller to get user's streak status, achievements, and unlock progress
 */
export async function getGamificationBadges(req, res, next) {
  try {
    let checkInDates = [];
    let products = [];
    let isOnboarded = true;
    let isDemo = false;

    if (isDbConnected()) {
      const [checkIns, dbProducts, user] = await Promise.all([
        CheckIn.find({ userId: req.user._id }).select('date routineType feelings'),
        Product.find({ userId: req.user._id }),
        User.findById(req.user._id).select('skinProfile'),
      ]);

      checkInDates = checkIns.map((c) => c.date);
      products = dbProducts || [];
      isOnboarded = Boolean(user?.skinProfile?.isOnboarded);
    } else {
      // In-memory sample data for offline fallback
      isDemo = true;
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        checkInDates.push(d.toISOString().split('T')[0]);
      }
      products = DEMO_SHELF_PRODUCTS;
      isOnboarded = true;
    }

    const streakData = calculateStreak(checkInDates);
    const productCount = products.length;
    const hasSunscreen = products.some((p) => p.category === 'sunscreen');

    // Check for barrier/hydrating actives
    const allActives = products.flatMap((p) =>
      Array.isArray(p.activeIngredients)
        ? p.activeIngredients.map((a) => String(a).toLowerCase())
        : []
    );
    const hasBarrierActives = allActives.some(
      (a) =>
        a.includes('ceramide') ||
        a.includes('hyaluronic') ||
        a.includes('panthenol') ||
        a.includes('b5') ||
        a.includes('centella')
    );

    // Evaluate badge unlock status
    const badges = BADGES_DEFINITION.map((badge) => {
      let isUnlocked = false;
      let progress = 0; // 0 to 100%
      let criteriaText = '';

      switch (badge.id) {
        case 'glow-starter':
          isUnlocked = isOnboarded;
          progress = isOnboarded ? 100 : 0;
          criteriaText = isOnboarded ? 'Đã hoàn thành khảo sát' : 'Chưa hoàn tất khảo sát hồ sơ da';
          break;

        case 'shelf-curator':
          isUnlocked = productCount >= 3;
          progress = Math.min(100, Math.round((productCount / 3) * 100));
          criteriaText = `${productCount}/3 sản phẩm trên kệ`;
          break;

        case 'sun-shield':
          isUnlocked = hasSunscreen;
          progress = hasSunscreen ? 100 : 0;
          criteriaText = hasSunscreen
            ? 'Đã có kem chống nắng bảo vệ'
            : 'Chưa có kem chống nắng trên kệ';
          break;

        case 'streak-flame':
          isUnlocked = streakData.longestStreak >= 3;
          progress = Math.min(100, Math.round((streakData.longestStreak / 3) * 100));
          criteriaText = `Kỷ lục chuỗi: ${streakData.longestStreak}/3 ngày`;
          break;

        case 'glass-skin-master':
          isUnlocked = streakData.longestStreak >= 7 || checkInDates.length >= 7;
          progress = Math.min(
            100,
            Math.round((Math.max(streakData.longestStreak, checkInDates.length) / 7) * 100)
          );
          criteriaText = `Tiến độ: ${Math.max(streakData.longestStreak, checkInDates.length)}/7 ngày`;
          break;

        case 'barrier-hero':
          isUnlocked = hasBarrierActives;
          progress = hasBarrierActives ? 100 : 0;
          criteriaText = hasBarrierActives
            ? 'Đã sở hữu mỹ phẩm phục hồi hàng rào ẩm'
            : 'Chưa có hoạt chất cấp ẩm/phục hồi (HA, B5, Ceramide)';
          break;

        default:
          isUnlocked = false;
          progress = 0;
          criteriaText = 'Chưa hoàn thành';
      }

      return {
        ...badge,
        isUnlocked,
        progress,
        criteriaText,
      };
    });

    const unlockedCount = badges.filter((b) => b.isUnlocked).length;
    const totalPoints = badges
      .filter((b) => b.isUnlocked)
      .reduce((sum, b) => sum + b.points, 0);

    return res.status(200).json({
      streak: streakData,
      badges,
      stats: {
        unlockedCount,
        totalBadges: badges.length,
        totalPoints,
      },
      isDemo,
    });
  } catch (err) {
    return next(err);
  }
}
