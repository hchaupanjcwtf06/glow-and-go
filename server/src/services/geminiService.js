import {
  ALLOWED_CATEGORIES,
  ALLOWED_ROUTINE_TIMES,
} from '../models/Product.js';

// Curated skincare knowledge base for instant offline matching or fallback
const POPULAR_SKINCARE_CATALOG = [
  {
    keywords: ['cerave', 'foaming', 'cleanser', 'rua mat cerave xanh ngoc'],
    name: 'CeraVe Foaming Facial Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Ceramides 1, 3, 6-II', 'Niacinamide', 'Hyaluronic Acid'],
    notes: 'Sữa rửa mặt dạng gel tạo bọt dịu nhẹ, cân bằng độ pH, phù hợp da thường đến dầu.',
  },
  {
    keywords: ['cerave', 'hydrating', 'rua mat cerave xanh la'],
    name: 'CeraVe Hydrating Facial Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Ceramides', 'Hyaluronic Acid', 'Glycerin'],
    notes: 'Sữa rửa mặt dưỡng ẩm dịu nhẹ, không bọt, thích hợp da khô đến da nhạy cảm.',
  },
  {
    keywords: ['paula', 'choice', 'bha', '2% bha', 'liquid exfoliant'],
    name: 'Paula’s Choice Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: 'Paula’s Choice',
    category: 'treatment',
    routineTime: 'night',
    paoMonths: 12,
    activeIngredients: ['Salicylic Acid 2%', 'Green Tea Extract', 'Methylpropanediol'],
    notes: 'Tẩy tế bào chết hóa học hỗ trợ làm sạch sâu lỗ chân lông, giảm bít tắc và mụn ẩn. Nên dùng buổi tối.',
  },
  {
    keywords: ['ordinary', 'niacinamide', 'zinc', 'to niacinamide'],
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'serum',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Niacinamide 10%', 'Zinc PCA 1%'],
    notes: 'Serum hỗ trợ điều tiết bã nhờn, làm dịu da và củng cố hàng rào bảo vệ.',
  },
  {
    keywords: ['ordinary', 'hyaluronic', 'ha', 'b5', 'to ha b5'],
    name: 'The Ordinary Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    category: 'serum',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Hyaluronic Acid', 'Pro-Vitamin B5 (Panthenol)'],
    notes: 'Serum cấp nước đa tầng, dưỡng ẩm phục hồi và làm căng bóng làn da.',
  },
  {
    keywords: ['cosrx', 'snail', 'mucin', 'oc sen'],
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    brand: 'COSRX',
    category: 'serum',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Snail Secretion Filtrate 96%', 'Sodium Hyaluronate', 'Panthenol'],
    notes: 'Tinh chất dịch nhầy ốc sên hỗ trợ phục hồi màng ẩm, tăng độ đàn hồi và làm dịu da.',
  },
  {
    keywords: ['laroche', 'la roche', 'cicaplast', 'baume b5', 'b5+'],
    name: 'La Roche-Posay Cicaplast Baume B5+',
    brand: 'La Roche-Posay',
    category: 'moisturizer',
    routineTime: 'both',
    paoMonths: 6,
    activeIngredients: ['Panthenol 5%', 'Madecassoside', 'Tribioma', 'Shea Butter'],
    notes: 'Kem dưỡng phục hồi đa năng làm dịu kích ứng, thích hợp sau peel hoặc khi da khô nứt nẻ.',
  },
  {
    keywords: ['anessa', 'sunscreen', 'kcn anessa', 'milk', 'vang'],
    name: 'Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++',
    brand: 'Anessa',
    category: 'sunscreen',
    routineTime: 'day',
    paoMonths: 12,
    activeIngredients: ['Zinc Oxide', 'Octocrylene', 'Collagen', 'Chiết xuất trà xanh'],
    notes: 'Sữa chống nắng kiềm dầu, chống nước và mồ hôi bền bỉ với công nghệ Auto Booster.',
  },
  {
    keywords: ['skin1004', 'centella', 'rau ma', 'ampoule'],
    name: 'Skin1004 Madagascar Centella Asiatica 100 Ampoule',
    brand: 'Skin1004',
    category: 'serum',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Centella Asiatica Extract 100%'],
    notes: 'Chiết xuất rau má tự nhiên giúp làm dịu nốt mụn đỏ, cấp ẩm dịu nhẹ cho da nhạy cảm.',
  },
  {
    keywords: ['klairs', 'supple', 'unscented', 'toner klairs'],
    name: 'Klairs Supple Preparation Unscented Toner',
    brand: 'Klairs',
    category: 'toner',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Sodium Hyaluronate', 'Centella Asiatica', 'Lipidure'],
    notes: 'Nước hoa hồng không mùi làm dịu và cân bằng ẩm tức thì, an toàn cho da cực kỳ nhạy cảm.',
  },
  {
    keywords: ['obagi', 'bha', 'clenziderm', 'pore therapy'],
    name: 'Obagi Medical Clenziderm M.D. Pore Therapy 2% BHA',
    brand: 'Obagi Medical',
    category: 'treatment',
    routineTime: 'night',
    paoMonths: 6,
    activeIngredients: ['Salicylic Acid 2%', 'Menthol'],
    notes: 'Dung dịch làm sạch sâu lỗ chân lông với cảm giác the mát, hỗ trợ kiểm soát mụn.',
  },
  {
    keywords: ['kiehl', 'ultra facial cream', 'kem duong kiehls'],
    name: 'Kiehl’s Ultra Facial Cream',
    brand: 'Kiehl’s',
    category: 'moisturizer',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Glacial Glycoprotein', 'Squalane cao cấp'],
    notes: 'Kem dưỡng ẩm suốt 24 giờ kết cấu mỏng nhẹ, củng cố màng giữ ẩm tự nhiên.',
  },
  {
    keywords: ['bioderma', 'sensibio', 'tay trang hong', 'micellar'],
    name: 'Bioderma Sensibio H2O Micellar Water',
    brand: 'Bioderma',
    category: 'cleanser',
    routineTime: 'both',
    paoMonths: 12,
    activeIngredients: ['Micelles Ester', 'Chiết xuất dưa leo', 'Mannitol'],
    notes: 'Nước tẩy trang dịu lành cho làn da nhạy cảm, làm sạch bụi bẩn và lớp trang điểm nhẹ nhàng.',
  },
];

/**
 * Searches the curated skincare catalog by keyword similarity
 */
function findInCatalog(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.toLowerCase().trim();

  // 1. Direct keyword token match
  const words = clean.split(/\s+/).filter((w) => w.length > 1);

  let bestMatch = null;
  let highestScore = 0;

  for (const item of POPULAR_SKINCARE_CATALOG) {
    let score = 0;
    const itemText = `${item.name} ${item.brand} ${item.keywords.join(' ')}`.toLowerCase();

    // Exact name or brand contains query
    if (item.name.toLowerCase().includes(clean)) score += 10;
    if (item.brand.toLowerCase().includes(clean)) score += 5;

    // Word by word matching
    for (const w of words) {
      if (itemText.includes(w)) {
        score += 2;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

/**
 * Generates a fallback draft when Gemini API is unavailable or query is generic
 */
function generateHeuristicDraft(query) {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  let category = 'other';
  let routineTime = 'both';
  let brand = '';

  const KNOWN_BRANDS = [
    'CeraVe',
    'Paula’s Choice',
    'Paula Choice',
    'The Ordinary',
    'La Roche-Posay',
    'La Roche Posay',
    'COSRX',
    'Anessa',
    'Skin1004',
    'Klairs',
    'Obagi',
    'Kiehl’s',
    'Kiehls',
    'Bioderma',
    'Bioré',
    'Biore',
    'Innisfree',
    'Vichy',
    'Avène',
    'Avene',
    'Neutrogena',
    'L’Oréal',
    'Loreal',
    'Hada Labo',
    'Simple',
    'SVR',
    'Drunk Elephant',
    'Some By Mi',
    'Torriden',
    'Round Lab',
    'Laneige',
  ];

  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      brand = b;
      break;
    }
  }

  if (lower.includes('cleanser') || lower.includes('rửa mặt') || lower.includes('tẩy trang')) {
    category = 'cleanser';
  } else if (lower.includes('toner') || lower.includes('nước hoa hồng') || lower.includes('lotion')) {
    category = 'toner';
  } else if (lower.includes('serum') || lower.includes('tinh chất') || lower.includes('ampoule')) {
    category = 'serum';
  } else if (
    lower.includes('bha') ||
    lower.includes('aha') ||
    lower.includes('retinol') ||
    lower.includes('tretinoin') ||
    lower.includes('peel')
  ) {
    category = 'treatment';
    routineTime = 'night';
  } else if (
    lower.includes('cream') ||
    lower.includes('dưỡng ẩm') ||
    lower.includes('kem dưỡng') ||
    lower.includes('gel dưỡng')
  ) {
    category = 'moisturizer';
  } else if (
    lower.includes('sunscreen') ||
    lower.includes('chống nắng') ||
    lower.includes('spf') ||
    lower.includes('kcn')
  ) {
    category = 'sunscreen';
    routineTime = 'day';
  } else if (lower.includes('mask') || lower.includes('mặt nạ')) {
    category = 'mask';
  }

  const detectedActives = [];
  if (lower.includes('bha') || lower.includes('salicylic')) detectedActives.push('Salicylic Acid (BHA)');
  if (lower.includes('aha') || lower.includes('glycolic')) detectedActives.push('AHA');
  if (lower.includes('retinol')) detectedActives.push('Retinol');
  if (lower.includes('niacinamide') || lower.includes('vitamin b3')) detectedActives.push('Niacinamide');
  if (lower.includes('hyaluronic') || lower.includes(' ha ')) detectedActives.push('Hyaluronic Acid');
  if (lower.includes('vitamin c')) detectedActives.push('Vitamin C');
  if (lower.includes('centella') || lower.includes('rau má')) detectedActives.push('Centella Asiatica');
  if (lower.includes('ceramide')) detectedActives.push('Ceramides');
  if (lower.includes('b5') || lower.includes('panthenol')) detectedActives.push('Pro-Vitamin B5');

  return {
    name: clean,
    brand,
    category,
    routineTime,
    paoMonths: category === 'treatment' ? 6 : 12,
    activeIngredients: detectedActives,
    notes: 'Bản nháp tự động từ từ khóa tìm kiếm. Vui lòng rà soát lại thông tin trước khi lưu.',
    source: 'heuristic',
    confidence: 'medium',
    disclaimer:
      'Dữ liệu gợi ý tự động mang tính tham khảo chăm sóc da, không phải chẩn đoán y khoa. Vui lòng kiểm tra lại bao bì thực tế trước khi lưu.',
  };
}

/**
 * Validates and normalizes draft properties against safety constraints
 */
function normalizeDraft(rawDraft, source = 'gemini') {
  const category = ALLOWED_CATEGORIES.includes(rawDraft.category)
    ? rawDraft.category
    : 'other';

  let routineTime = ALLOWED_ROUTINE_TIMES.includes(rawDraft.routineTime)
    ? rawDraft.routineTime
    : 'both';

  // Skincare Safety Constraint: Sunscreens belong to daytime routines
  if (category === 'sunscreen') {
    routineTime = 'day';
  }

  // Active exfoliants / retinoids strongly recommended for nighttime
  const activeString = Array.isArray(rawDraft.activeIngredients)
    ? rawDraft.activeIngredients.join(' ').toLowerCase()
    : String(rawDraft.activeIngredients || '').toLowerCase();

  if (
    category === 'treatment' &&
    (activeString.includes('retinol') ||
      activeString.includes('tretinoin') ||
      activeString.includes('salicylic') ||
      activeString.includes('bha') ||
      activeString.includes('glycolic') ||
      activeString.includes('aha'))
  ) {
    routineTime = 'night';
  }

  const validPaos = [3, 6, 9, 12, 18, 24, 36];
  let paoMonths = Number(rawDraft.paoMonths);
  if (!paoMonths || !validPaos.includes(paoMonths)) {
    paoMonths = 12;
  }

  const activeIngredients = Array.isArray(rawDraft.activeIngredients)
    ? rawDraft.activeIngredients
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0)
        .slice(0, 8)
    : [];

  return {
    name: String(rawDraft.name || '').trim(),
    brand: String(rawDraft.brand || '').trim(),
    category,
    routineTime,
    paoMonths,
    activeIngredients,
    notes: String(rawDraft.notes || '').trim().slice(0, 300),
    source,
    confidence: rawDraft.confidence || (source === 'catalog' ? 'high' : 'medium'),
    isDraft: true,
    disclaimer:
      'Dữ liệu gợi ý tự động mang tính tham khảo chăm sóc da, không phải chẩn đoán y khoa. Vui lòng kiểm tra lại bao bì thực tế trước khi lưu.',
  };
}

/**
 * Calls Google Gemini REST API to suggest structured product details
 */
export async function suggestProductWithGemini(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw new Error('Query must be at least 2 characters.');
  }

  const cleanQuery = query.trim();

  // Step 1: Check curated catalog first for instant response
  const catalogMatch = findInCatalog(cleanQuery);
  if (catalogMatch) {
    return normalizeDraft(catalogMatch, 'catalog');
  }

  // Step 2: If GEMINI_API_KEY is not configured, fall back to heuristic
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return normalizeDraft(generateHeuristicDraft(cleanQuery), 'fallback');
  }

  // Step 3: Call Google Gemini REST API directly with standard fetch
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Bạn là trợ lý dữ liệu mỹ phẩm của Glow & Go.
Hãy phân tích tên/thương hiệu sản phẩm chăm sóc da sau và trả về DUY NHẤT một JSON hợp lệ (không kèm markdown):
Sản phẩm: "${cleanQuery}"

Yêu cầu định dạng JSON chính xác:
{
  "name": "Tên sản phẩm chuẩn đầy đủ",
  "brand": "Thương hiệu chính xác",
  "category": "Một trong: cleanser | toner | serum | treatment | moisturizer | sunscreen | mask | other",
  "routineTime": "Một trong: day | night | both (kem chống nắng phải là 'day', treatment chứa AHA/BHA/Retinol ưu tiên 'night')",
  "paoMonths": 6 hoặc 12 hoặc 24 (số tháng hạn sử dụng sau mở nắp tiêu chuẩn),
  "activeIngredients": ["Hoạt chất chính 1", "Hoạt chất chính 2"],
  "notes": "Tóm tắt ngắn gọn đặc tính và cách dùng an toàn (dưới 200 ký tự)"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Falling back to heuristic draft.`);
      return normalizeDraft(generateHeuristicDraft(cleanQuery), 'fallback');
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return normalizeDraft(generateHeuristicDraft(cleanQuery), 'fallback');
    }

    const parsed = JSON.parse(text);
    return normalizeDraft(parsed, 'gemini');
  } catch (err) {
    console.warn('Gemini suggestion failed or timed out:', err.message);
    return normalizeDraft(generateHeuristicDraft(cleanQuery), 'fallback');
  }
}
