import { getEnvironmentalData } from '../services/weatherService.js';
import { buildRoutine, DEMO_SHELF_PRODUCTS } from '../services/routineEngine.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

/**
 * Controller to fetch environmental conditions (weather, UV index, AQI)
 */
export async function getEnvironment(req, res, next) {
  try {
    const { city, lat, lon } = req.query;
    const envData = await getEnvironmentalData(
      city,
      lat ? Number(lat) : null,
      lon ? Number(lon) : null
    );

    return res.status(200).json({
      environment: envData,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Controller to calculate personalized daily skincare routine
 * with safety filters and environmental context.
 */
export async function getDailyRoutine(req, res, next) {
  try {
    const { type = 'day', city = 'hcm', lat, lon } = req.query;
    const routineType = type === 'night' ? 'night' : 'day';

    const envData = await getEnvironmentalData(
      city,
      lat ? Number(lat) : null,
      lon ? Number(lon) : null
    );

    let userProducts = [];
    let skinProfile = {};
    let isDemo = false;

    if (isSupabaseConfigured()) {
      const [productsRes, userRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('user_id', req.user._id || req.user.id),
        supabase
          .from('users')
          .select('skin_profile')
          .eq('id', req.user._id || req.user.id)
          .maybeSingle(),
      ]);

      skinProfile = userRes.data?.skin_profile || req.user.skinProfile || {};
      const dbProducts = productsRes.data || [];
      if (dbProducts.length > 0) {
        userProducts = dbProducts.map((p) => ({
          _id: p.id,
          id: p.id,
          name: p.name,
          category: p.category,
          routineTime: p.routine_time,
          activeIngredients: p.active_ingredients || [],
        }));
      } else {
        // Shelf is empty: provide rich demo shelf so routine engine demonstrates full value
        userProducts = DEMO_SHELF_PRODUCTS;
        isDemo = true;
      }
    } else {
      // Graceful fallback when running in offline/demo mode
      userProducts = DEMO_SHELF_PRODUCTS;
      skinProfile = req.user?.skinProfile || {
        skinType: 'combination',
        sensitivityLevel: 'low',
        concerns: ['oiliness', 'pore'],
        goals: ['hydration', 'barrier'],
      };
      isDemo = true;
    }

    const routine = buildRoutine({
      products: userProducts,
      skinProfile,
      envData,
      routineType,
    });

    return res.status(200).json({
      routine,
      environment: envData,
      isDemo,
      database: isSupabaseConfigured() ? 'supabase' : 'offline_demo',
    });
  } catch (err) {
    return next(err);
  }
}
