import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

export default function ProductShelf() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('day'); // 'day' | 'night' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    let ignore = false;

    api
      .get('/products')
      .then((res) => {
        if (!ignore) {
          setProducts(res.data.products || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.error?.message ||
            err.message ||
            'Không thể tải danh sách sản phẩm.'
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const reloadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products || []);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Không thể cập nhật danh sách sản phẩm.'
      );
    }
  };

  const handleSaveProduct = async (payload, productId) => {
    if (productId) {
      await api.put(`/products/${productId}`, payload);
    } else {
      await api.post('/products', payload);
    }
    await reloadProducts();
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn bỏ sản phẩm này khỏi kệ không?'
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${productId}`);
      await reloadProducts();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
        'Không thể xóa sản phẩm. Vui lòng thử lại!'
      );
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Filter products by active tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'day') return p.routineTime === 'day' || p.routineTime === 'both';
    if (activeTab === 'night') return p.routineTime === 'night' || p.routineTime === 'both';
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Shelf Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-rose-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
              Kệ mỹ phẩm ảo 🧴
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {products.length} sản phẩm
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Tủ chăm sóc da Ngày &amp; Đêm
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân loại và sắp xếp trực quan theo đúng thứ tự chu trình skincare khoa học.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs shadow-md shadow-rose-200 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-2"
        >
          <span className="text-base leading-none">+</span>
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Routine Tabs (Day / Night / All) */}
      <div className="flex p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-rose-100/80 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('day')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'day'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>☀️</span>
          <span>Kệ Buổi Sáng</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {products.filter((p) => p.routineTime === 'day' || p.routineTime === 'both').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('night')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'night'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🌙</span>
          <span>Kệ Buổi Tối</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {products.filter((p) => p.routineTime === 'night' || p.routineTime === 'both').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📦</span>
          <span>Tất cả</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {products.length}
          </span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={reloadProducts}
            className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px]"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-white/60 animate-pulse border border-rose-100/60"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty Shelf State */
        <div className="glass-card rounded-3xl p-10 text-center space-y-4 border-2 border-dashed border-rose-200/80">
          <span className="text-5xl block animate-bounce">
            {activeTab === 'day' ? '☀️' : activeTab === 'night' ? '🌙' : '🧴'}
          </span>
          <h4 className="text-lg font-black text-slate-800">
            {activeTab === 'day'
              ? 'Kệ buổi sáng của bạn đang trống'
              : activeTab === 'night'
              ? 'Kệ buổi tối của bạn đang trống'
              : 'Chưa có sản phẩm nào trong tủ mỹ phẩm'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {activeTab === 'day'
              ? 'Thêm kem chống nắng hoặc sữa rửa mặt dịu nhẹ để bắt đầu chu trình bảo vệ da ban ngày!'
              : activeTab === 'night'
              ? 'Thêm serum phục hồi hoặc kem dưỡng ẩm để nuôi dưỡng da trong giấc ngủ!'
              : 'Bắt đầu thêm các món mỹ phẩm bạn đang sử dụng để theo dõi chu trình và hạn mở nắp.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition cursor-pointer"
          >
            + Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        /* Virtual Shelf Display */
        <div className="space-y-4">
          {/* Aesthetic Shelf Rack Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {/* Wooden / Acrylic shelf footer line */}
          <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-200/70 via-rose-200/60 to-amber-200/70 shadow-xs border-t border-amber-300/40" />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
