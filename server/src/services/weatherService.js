// Major Vietnamese cities with geographic coordinates
export const CITIES = {
  hcm: {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    lat: 10.8231,
    lon: 106.6297,
  },
  hanoi: {
    id: 'hanoi',
    name: 'Hà Nội',
    lat: 21.0285,
    lon: 105.8542,
  },
  danang: {
    id: 'danang',
    name: 'Đà Nẵng',
    lat: 16.0544,
    lon: 108.2022,
  },
  cantho: {
    id: 'cantho',
    name: 'Cần Thơ',
    lat: 10.0452,
    lon: 105.7469,
  },
  haiphong: {
    id: 'haiphong',
    name: 'Hải Phòng',
    lat: 20.8449,
    lon: 106.6881,
  },
  dalat: {
    id: 'dalat',
    name: 'Đà Lạt',
    lat: 11.9404,
    lon: 108.4583,
  },
};

/**
 * Returns UV index assessment with skincare-specific recommendation
 */
export function evaluateUvIndex(uv) {
  const value = Math.max(0, Math.round((Number(uv) || 0) * 10) / 10);

  if (value < 3) {
    return {
      level: 'Thấp',
      risk: 'low',
      color: 'emerald',
      advice: 'Tia UV yếu. Duy trì kem chống nắng mỏng nhẹ hoặc kem dưỡng ban ngày.',
    };
  }
  if (value < 6) {
    return {
      level: 'Trung bình',
      risk: 'moderate',
      color: 'amber',
      advice: 'Cần thoa kem chống nắng SPF 30-50 trước khi ra ngoài 20 phút.',
    };
  }
  if (value < 8) {
    return {
      level: 'Cao',
      risk: 'high',
      color: 'orange',
      advice: 'Bức xạ UV cao! Bắt buộc thoa KCN SPF 50+, thoa lại sau 2-3h nếu ngoài trời.',
    };
  }
  if (value < 11) {
    return {
      level: 'Rất cao',
      risk: 'very-high',
      color: 'rose',
      advice: 'Bức xạ UV rất gay gắt. Che chắn thêm mũ, kính râm, hạn chế nắng 10h-15h.',
    };
  }
  return {
    level: 'Cực kỳ nguy hại',
    risk: 'extreme',
    color: 'purple',
    advice: 'Mức UV cực đỉnh. Tránh ra nắng trực tiếp, thoa chống nắng quang phổ rộng.',
  };
}

/**
 * Returns AQI assessment with skincare hygiene recommendation
 */
export function evaluateAqi(aqi) {
  const value = Math.max(0, Math.round(Number(aqi) || 0));

  if (value <= 50) {
    return {
      level: 'Tốt',
      color: 'emerald',
      advice: 'Không khí trong lành, rửa mặt làm sạch dịu nhẹ hàng ngày.',
    };
  }
  if (value <= 100) {
    return {
      level: 'Trung bình',
      color: 'amber',
      advice: 'Không khí chấp nhận được. Duy trì làm sạch đủ bước vào buổi tối.',
    };
  }
  if (value <= 150) {
    return {
      level: 'Kém (Nhạy cảm)',
      color: 'orange',
      advice: 'Bụi mịn tăng. Khuyến nghị tẩy trang và làm sạch kép (double cleansing) buổi tối.',
    };
  }
  return {
    level: 'Ô nhiễm / Xấu',
    color: 'rose',
    advice: 'Bụi mịn cao. Làm sạch kép dịu nhẹ (không chà xát mạnh) và tăng cường serum phục hồi.',
  };
}

/**
 * Returns humidity assessment with skin barrier hydration advice
 */
export function evaluateHumidity(humidity) {
  const val = Number(humidity) || 60;
  if (val < 50) {
    return {
      status: 'Khô hanh',
      advice: 'Không khí khô dễ gây mất nước qua biểu bì (TEWL). Vỗ toner nhiều lớp và dùng kem khóa ẩm.',
    };
  }
  if (val > 80) {
    return {
      status: 'Độ ẩm rất cao',
      advice: 'Thời tiết nồm/ẩm ướt. Ưu tiên kem dưỡng dạng gel lỏng nhẹ để tránh bít tắc lỗ chân lông.',
    };
  }
  return {
    status: 'Lý tưởng',
    advice: 'Độ ẩm thuận lợi cho màng ẩm tự nhiên của da.',
  };
}

/**
 * Fetches real-time environmental data for a city or coordinates
 */
export async function getEnvironmentalData(cityKey = 'hcm', customLat = null, customLon = null) {
  const city = CITIES[cityKey] || CITIES.hcm;
  const lat = customLat || city.lat;
  const lon = customLon || city.lon;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Call Open-Meteo weather + UV API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index,weather_code&timezone=Asia%2FBangkok`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=Asia%2FBangkok`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(aqiUrl, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    let temperature = 31;
    let humidity = 68;
    let uvIndex = 6.2;
    let aqi = 72;

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      const wData = await weatherRes.value.json();
      if (wData.current) {
        temperature = Math.round(wData.current.temperature_2m ?? temperature);
        humidity = Math.round(wData.current.relative_humidity_2m ?? humidity);
        uvIndex = Number(wData.current.uv_index ?? uvIndex);
      }
    }

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      const aData = await aqiRes.value.json();
      if (aData.current && typeof aData.current.us_aqi === 'number') {
        aqi = Math.round(aData.current.us_aqi);
      }
    }

    const uvEvaluation = evaluateUvIndex(uvIndex);
    const aqiEvaluation = evaluateAqi(aqi);
    const humidityEvaluation = evaluateHumidity(humidity);

    return {
      city: city.name,
      cityId: city.id,
      coordinates: { lat, lon },
      temperature,
      humidity,
      uvIndex,
      aqi,
      evaluations: {
        uv: uvEvaluation,
        aqi: aqiEvaluation,
        humidity: humidityEvaluation,
      },
      source: 'open-meteo',
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    // Graceful offline fallback
    const fallbackUv = 5.8;
    const fallbackAqi = 65;
    const fallbackHumidity = 70;

    return {
      city: city.name,
      cityId: city.id,
      coordinates: { lat, lon },
      temperature: 30,
      humidity: fallbackHumidity,
      uvIndex: fallbackUv,
      aqi: fallbackAqi,
      evaluations: {
        uv: evaluateUvIndex(fallbackUv),
        aqi: evaluateAqi(fallbackAqi),
        humidity: evaluateHumidity(fallbackHumidity),
      },
      source: 'offline-fallback',
      updatedAt: new Date().toISOString(),
    };
  }
}

