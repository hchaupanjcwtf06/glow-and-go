import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Auto-resolve .env from server/ directory or workspace root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import app from './app.js';
import { isSupabaseConfigured } from './supabase.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (isSupabaseConfigured()) {
    console.log('✅ Supabase Cloud Database: Connected successfully.');
  } else {
    console.log(
      '💡 Chế độ Demo Offline: Đang sử dụng bộ nhớ tạm (chưa cấu hình SUPABASE_URL trong server/.env).'
    );
  }
});
