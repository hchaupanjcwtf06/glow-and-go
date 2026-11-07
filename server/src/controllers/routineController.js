import { getEnvironmentalData } from '../services/weatherService.js';
import { buildRoutine, DEMO_SHELF_PRODUCTS } from '../services/routineEngine.js';
import { isDbConnected } from '../db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

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

    if (isDbConnected()) {
      const [products, user] = await Promise.all([
        Product.find({ userId: req.user._id }),
        User.findById(req.user._id).select('skinProfile'),
      ]);

      skinProfile = user?.skinProfile || {};

      if (products && products.length > 0) {
        userProducts = products;
      } else {
        // Shelf is empty: provide rich demo shelf so routine engine demonstrates full value
        userProducts = DEMO_SHELF_PRODUCTS;
        isDemo = true;
      }
    } else {
      // Graceful fallback when MongoDB is unconfigured/offline
      userProducts = DEMO_SHELF_PRODUCTS;
      skinProfile = {
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
      database: isDbConnected() ? 'connected' : 'disconnected',
    });
  } catch (err) {
    return next(err);
  }
}

