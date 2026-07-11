'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { getProducts } from '@/lib/db';
import { Loader2, Zap } from 'lucide-react';

export default function FlashSaleClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((prods) => {
      // Filter for active flash sale products
      const flashSaleProducts = prods.filter(p => p.isActive && p.isFlashSale);
      setProducts(flashSaleProducts);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Zap className="w-10 h-10 fill-white text-white animate-pulse" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Flash Sale</h1>
              <p className="text-orange-100 font-medium mt-1">Limited time offers. Grab them before they're gone!</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} isFlashSalePage={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flash Sale Active</h3>
            <p className="text-gray-500">Check back later for exciting new offers!</p>
          </div>
        )}
      </div>
    </div>
  );
}
