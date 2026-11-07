import CheckIn, { ALLOWED_FEELINGS } from '../models/CheckIn.js';
import { isDbConnected } from '../db.js';

// Pre-populated sample records for immediate demo & offline resilience
const createSampleHistory = () => {
  const today = new Date();
  const samples = [];
  const ratings = [4, 3, 5, 4, 4, 3, 5];
  const feelingSets = [
    ['ẩm mượt', 'dịu da'],
    ['đổ dầu nhờn'],
    ['căng bóng rạng rỡ', 'ẩm mượt'],
    ['dịu da', 'bình thường'],
    ['ẩm mượt', 'căng bóng rạng rỡ'],
    ['khô căng'],
    ['căng bóng rạng rỡ', 'ẩm mượt', 'dịu da'],
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const idx = 6 - i;

    samples.push({
      _id: `demo-ci-${i}`,
      userId: '507f1f77bcf86cd799439011',
      date: dateStr,
      routineType: idx % 2 === 0 ? 'night' : 'day',
      rating: ratings[idx],
      feelings: feelingSets[idx],
      completedStepsCount: ratings[idx] >= 4 ? 5 : 3,
      notes: idx === 6 ? 'Da đủ ẩm, bớt đổ dầu vùng chữ T.' : '',
      environmentalContext: {
        city: 'TP. Hồ Chí Minh',
        temperature: 30,
        humidity: 68,
        uvIndex: 6.0,
        aqi: 75,
      },
      createdAt: d,
    });
  }
  return samples;
};

// In-memory store for disconnected database mode
let inMemoryCheckIns = createSampleHistory();

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Saves a new daily skin check-in
 */
export async function createCheckIn(req, res, next) {
  try {
    const {
      rating,
      routineType = 'day',
      date = getTodayString(),
      feelings = [],
      completedStepsCount = 0,
      notes = '',
      environmentalContext = {},
    } = req.body || {};

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        error: {
          message: 'Đánh giá cảm nhận da phải là số từ 1 đến 5 sao.',
          status: 400,
        },
      });
    }

    const cleanFeelings = Array.isArray(feelings)
      ? feelings.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const recordData = {
      userId: req.user._id,
      date,
      routineType: ['day', 'night', 'both'].includes(routineType)
        ? routineType
        : 'day',
      rating: numRating,
      feelings: cleanFeelings,
      completedStepsCount: Number(completedStepsCount) || 0,
      notes: String(notes || '').trim().slice(0, 300),
      environmentalContext: {
        city: environmentalContext.city || 'TP. Hồ Chí Minh',
        temperature: environmentalContext.temperature ?? null,
        humidity: environmentalContext.humidity ?? null,
        uvIndex: environmentalContext.uvIndex ?? null,
        aqi: environmentalContext.aqi ?? null,
      },
    };

    if (isDbConnected()) {
      // Upsert check-in for the same user, date, and routineType
      const checkIn = await CheckIn.findOneAndUpdate(
        { userId: req.user._id, date, routineType: recordData.routineType },
        recordData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(201).json({
        message: 'Lưu nhật ký check-in thành công!',
        checkIn,
      });
    }

    // In-memory fallback
    const newRecord = {
      _id: `mem-${Date.now()}`,
      ...recordData,
      createdAt: new Date(),
    };
    inMemoryCheckIns.unshift(newRecord);

    return res.status(201).json({
      message: 'Lưu nhật ký check-in thành công (bộ nhớ tạm)!',
      checkIn: newRecord,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Checks if user has already checked in today
 */
export async function getTodayCheckIn(req, res, next) {
  try {
    const todayStr = getTodayString();
    const { routineType = 'day' } = req.query;

    if (isDbConnected()) {
      const checkIn = await CheckIn.findOne({
        userId: req.user._id,
        date: todayStr,
        routineType,
      });

      return res.status(200).json({
        hasCheckedIn: Boolean(checkIn),
        checkIn: checkIn || null,
        date: todayStr,
      });
    }

    // In-memory search
    const checkIn = inMemoryCheckIns.find(
      (c) => c.date === todayStr && c.routineType === routineType
    );

    return res.status(200).json({
      hasCheckedIn: Boolean(checkIn),
      checkIn: checkIn || null,
      date: todayStr,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Returns recent check-in history
 */
export async function getCheckInHistory(req, res, next) {
  try {
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 14));

    if (isDbConnected()) {
      const checkIns = await CheckIn.find({ userId: req.user._id })
        .sort({ date: -1, createdAt: -1 })
        .limit(limit);

      return res.status(200).json({
        count: checkIns.length,
        checkIns,
      });
    }

    const checkIns = inMemoryCheckIns.slice(0, limit);
    return res.status(200).json({
      count: checkIns.length,
      checkIns,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Computes trend report with ratings distribution, sample size N,
 * feeling breakdowns, and medical limitations disclaimer.
 */
export async function getCheckInReport(req, res, next) {
  try {
    let records = [];

    if (isDbConnected()) {
      records = await CheckIn.find({ userId: req.user._id }).sort({ date: 1 });
      if (!records || records.length === 0) {
        records = inMemoryCheckIns;
      }
    } else {
      records = inMemoryCheckIns;
    }

    const sampleSize = records.length;
    if (sampleSize === 0) {
      return res.status(200).json({
        report: {
          sampleSize: 0,
          averageRating: 0,
          adherenceRate: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          feelingsBreakdown: {},
          recentTrend: [],
          disclaimer:
            'Chưa có dữ liệu check-in. Hãy ghi nhận nhật ký sau mỗi routine để theo dõi tiến trình.',
        },
        isDemo: !isDbConnected(),
      });
    }

    const totalScore = records.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalScore / sampleSize) * 10) / 10;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const feelingsBreakdown = {};
    let adherenceCount = 0;

    records.forEach((r) => {
      if (ratingDistribution[r.rating] !== undefined) {
        ratingDistribution[r.rating]++;
      }
      if (r.completedStepsCount >= 3) {
        adherenceCount++;
      }
      if (Array.isArray(r.feelings)) {
        r.feelings.forEach((f) => {
          feelingsBreakdown[f] = (feelingsBreakdown[f] || 0) + 1;
        });
      }
    });

    const adherenceRate = Math.round((adherenceCount / sampleSize) * 100);

    // Format last 7 records for visual trend bars
    const recentRecords = records.slice(-7);
    const recentTrend = recentRecords.map((r) => {
      const parts = r.date.split('-');
      const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : r.date;
      return {
        date: r.date,
        shortDate,
        rating: r.rating,
        routineType: r.routineType,
        completedSteps: r.completedStepsCount,
      };
    });

    return res.status(200).json({
      report: {
        sampleSize,
        averageRating,
        adherenceRate,
        ratingDistribution,
        feelingsBreakdown,
        recentTrend,
        disclaimer: `Lưu ý khoa học: Báo cáo xu hướng được tổng hợp từ cảm nhận chủ quan do người dùng tự ghi nhận (cỡ mẫu N=${sampleSize} lượt check-in). Đây là công cụ hỗ trợ theo dõi thói quen chăm sóc da, không phải bằng chứng lâm sàng chứng minh một sản phẩm cụ thể gây ra sự cải thiện da.`,
      },
      isDemo: !isDbConnected(),
    });
  } catch (err) {
    return next(err);
  }
}

