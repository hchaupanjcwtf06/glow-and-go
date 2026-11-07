import { CATEGORY_STEP_MAP } from '../models/Product.js';

export const DEMO_SHELF_PRODUCTS = [
  {
    _id: 'demo-p1',
    name: 'CeraVe Foaming Facial Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    routineTime: 'both',
    stepOrder: 1,
    paoMonths: 12,
    activeIngredients: ['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
    notes: 'Làm sạch dịu nhẹ, cân bằng độ pH.',
  },
  {
    _id: 'demo-p2',
    name: 'Klairs Supple Preparation Unscented Toner',
    brand: 'Klairs',
    category: 'toner',
    routineTime: 'both',
    stepOrder: 2,
    paoMonths: 12,
    activeIngredients: ['Centella Asiatica', 'Hyaluronic Acid'],
    notes: 'Cân bằng ẩm, làm dịu da nhạy cảm.',
  },
  {
    _id: 'demo-p3',
    name: 'The Ordinary Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    category: 'serum',
    routineTime: 'both',
    stepOrder: 3,
    paoMonths: 12,
    activeIngredients: ['Hyaluronic Acid', 'Panthenol (B5)'],
    notes: 'Cấp nước đa tầng, căng bóng màng ẩm.',
  },
  {
    _id: 'demo-p4',
    name: 'Paula’s Choice Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: 'Paula’s Choice',
    category: 'treatment',
    routineTime: 'night',
    stepOrder: 4,
    paoMonths: 12,
    activeIngredients: ['Salicylic Acid 2%', 'Green Tea'],
    notes: 'Làm sạch sâu bã nhờn, thông thoáng lỗ chân lông.',
  },
  {
    _id: 'demo-p5',
    name: 'La Roche-Posay Cicaplast Baume B5+',
    brand: 'La Roche-Posay',
    category: 'moisturizer',
    routineTime: 'both',
    stepOrder: 5,
    paoMonths: 6,
    activeIngredients: ['Panthenol 5%', 'Madecassoside'],
    notes: 'Kem dưỡng phục hồi và làm dịu màng tế bào.',
  },
  {
    _id: 'demo-p6',
    name: 'Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++',
    brand: 'Anessa',
    category: 'sunscreen',
    routineTime: 'day',
    stepOrder: 6,
    paoMonths: 12,
    activeIngredients: ['Zinc Oxide', 'Collagen', 'Trà xanh'],
    notes: 'Chống nắng quang phổ rộng, kiềm dầu.',
  },
];

const STEP_LABELS = {
  cleanser: { name: 'Làm sạch da', icon: '🧼', desc: 'Loại bỏ dầu thừa, bụi bẩn và kem chống nắng' },
  toner: { name: 'Cân bằng ẩm (Toner)', icon: '💧', desc: 'Cân bằng pH và mở đường dẫn cho dưỡng chất' },
  serum: { name: 'Tinh chất chuyên sâu (Serum)', icon: '🧪', desc: 'Nuôi dưỡng tế bào và phục hồi hàng rào ẩm' },
  treatment: { name: 'Đặc trị (Treatment)', icon: '🎯', desc: 'Tẩy tế bào chết hóa học hoặc hoạt chất tái tạo' },
  moisturizer: { name: 'Kem dưỡng / Khóa ẩm', icon: '🧴', desc: 'Khóa ẩm, ngăn chặn mất nước qua biểu bì' },
  sunscreen: { name: 'Bảo vệ chống nắng', icon: '☀️', desc: 'Ngăn ngừa tia UVA/UVB và lão hóa quang học' },
  mask: { name: 'Mặt nạ bổ sung', icon: '🧖‍♀️', desc: 'Bổ sung dưỡng chất và thư giãn làn da' },
  other: { name: 'Chăm sóc bổ trợ', icon: '✨', desc: 'Sản phẩm chăm sóc chuyên biệt' },
};

/**
 * Builds a deterministic, safety-filtered skincare routine based on user shelf,
 * skin profile, and real-time environmental context.
 */
export function buildRoutine({
  products = [],
  skinProfile = {},
  envData = {},
  routineType = 'day',
}) {
  const isDay = routineType === 'day';
  const effectiveType = isDay ? 'day' : 'night';

  const userSensitivity = skinProfile.sensitivityLevel || 'low';
  const skinType = skinProfile.skinType || 'combination';

  // 1. Filter shelf items suitable for this time of day
  let shelfItems = (products && products.length > 0 ? products : []).filter((p) => {
    if (isDay) {
      return p.routineTime === 'day' || p.routineTime === 'both';
    }
    // Night routine: exclude sunscreen
    return (p.routineTime === 'night' || p.routineTime === 'both') && p.category !== 'sunscreen';
  });

  // Sort strictly by scientific step sequence
  shelfItems.sort((a, b) => {
    const orderA = typeof a.stepOrder === 'number' ? a.stepOrder : CATEGORY_STEP_MAP[a.category] || 99;
    const orderB = typeof b.stepOrder === 'number' ? b.stepOrder : CATEGORY_STEP_MAP[b.category] || 99;
    return orderA - orderB;
  });

  // 2. Identify active ingredients present on the shelf
  const allActives = [];
  shelfItems.forEach((item) => {
    if (Array.isArray(item.activeIngredients)) {
      item.activeIngredients.forEach((act) => allActives.push(act.toLowerCase()));
    }
  });

  const hasRetinoid = allActives.some((a) => a.includes('retinol') || a.includes('tretinoin'));
  const hasExfoliant = allActives.some(
    (a) => a.includes('bha') || a.includes('salicylic') || a.includes('aha') || a.includes('glycolic')
  );
  const hasSunscreen = shelfItems.some((p) => p.category === 'sunscreen');

  // 3. Rule-Based Safety Alerts & Guidance
  const safetyNotices = [];
  const weatherTips = [];

  // Safety rule 1: Retinoid + BHA/AHA conflict in night routine
  if (!isDay && hasRetinoid && hasExfoliant) {
    if (userSensitivity === 'high' || userSensitivity === 'medium') {
      safetyNotices.push({
        type: 'warning',
        title: 'Lưu ý kết hợp hoạt chất mạnh',
        message:
          'Routine tối nay của bạn chứa cả Retinoid và AHA/BHA. Với nền da nhạy cảm hoặc dễ đỏ, hãy dùng cách ngày (ví dụ: tối chẵn dùng BHA, tối lẻ dùng Retinol) để tránh kích ứng quá tải hàng rào ẩm.',
      });
    }
  }

  // Safety rule 2: Day routine requires sunscreen protection, especially with actives
  if (isDay) {
    if (!hasSunscreen) {
      safetyNotices.push({
        type: 'caution',
        title: 'Thiếu bước chống nắng ban ngày',
        message:
          'Bạn chưa có kem chống nắng trong kệ buổi sáng. Tia UV là nguyên nhân hàng đầu gây sạm nám và đứt gãy collagen — hãy bổ sung kem chống nắng phổ rộng để bảo vệ da.',
      });
    } else if (hasExfoliant || hasRetinoid) {
      safetyNotices.push({
        type: 'info',
        title: 'Tăng cường bảo vệ quang học',
        message:
          'Da đang làm quen hoặc sử dụng hoạt chất treatment tái tạo. Hãy đảm bảo thoa đủ 2 đốt ngón tay kem chống nắng và che chắn kỹ trước khi ra nắng.',
      });
    }
  }

  // Safety rule 3: Environmental weather-adaptive tips
  const uvVal = Number(envData.uvIndex) || 0;
  if (isDay && uvVal >= 6) {
    weatherTips.push({
      badge: 'Chỉ số UV cao',
      icon: '☀️',
      text: `Chỉ số UV hiện tại đạt ${uvVal} (${envData.evaluations?.uv?.level || 'Cao'}). Thoa lại kem chống nắng sau mỗi 2–3 giờ nếu tiếp xúc ánh sáng mặt trời.`,
    });
  }

  const aqiVal = Number(envData.aqi) || 0;
  if (!isDay && aqiVal > 100) {
    weatherTips.push({
      badge: 'Chỉ số bụi mịn AQI',
      icon: '💨',
      text: `Chỉ số AQI là ${aqiVal} (${envData.evaluations?.aqi?.level || 'Kém'}). Khuyến nghị làm sạch kép bằng nước tẩy trang dịu nhẹ trước khi rửa mặt.`,
    });
  }

  const humidityVal = Number(envData.humidity) || 60;
  if (humidityVal < 50) {
    weatherTips.push({
      badge: 'Độ ẩm không khí thấp',
      icon: '💧',
      text: 'Thời tiết khô hanh có thể làm tăng mất nước biểu bì (TEWL). Vỗ toner nhiều lớp hoặc thêm serum cấp ẩm trước bước kem khóa ẩm.',
    });
  }

  // 4. Map into structured execution steps
  const steps = shelfItems.map((prod, idx) => {
    const meta = STEP_LABELS[prod.category] || STEP_LABELS.other;
    return {
      stepNumber: idx + 1,
      category: prod.category,
      categoryLabel: meta.name,
      icon: meta.icon,
      description: meta.desc,
      product: {
        _id: prod._id,
        name: prod.name,
        brand: prod.brand,
        paoMonths: prod.paoMonths,
        activeIngredients: prod.activeIngredients || [],
        notes: prod.notes || '',
      },
      completed: false,
    };
  });

  return {
    routineType: effectiveType,
    title: isDay ? '☀️ Routine Chăm Sóc Da Buổi Sáng' : '🌙 Routine Phục Hồi & Tái Tạo Buổi Tối',
    skinContext: {
      skinType,
      sensitivityLevel: userSensitivity,
    },
    environmentalSummary: {
      city: envData.city || 'TP. Hồ Chí Minh',
      temperature: envData.temperature ?? 30,
      humidity: envData.humidity ?? 65,
      uvIndex: envData.uvIndex ?? 5,
      aqi: envData.aqi ?? 70,
    },
    totalSteps: steps.length,
    steps,
    safetyNotices,
    weatherTips,
    disclaimer:
      'Gợi ý chu trình chăm sóc da mang tính chất tham khảo dựa trên nguyên lý khoa học thẩm mỹ thường ngày, không thay thế chẩn đoán hoặc chỉ định điều trị y khoa.',
  };
}

